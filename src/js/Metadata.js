// Copyright 2017 Telefónica Digital España S.L.
//
// This file is part of UrboCore WWW.
//
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
//
// For those usages not covered by this license please contact with
// iot_support at tid dot es

(function () {

  /**
   * Metadata has all information about 'scopes',
   * 'catalogs' and others.
   *
   * This Object will be fill in the APP initialization,
   * because this information will be used in future actions.
   */
  var metadata = function () {
    this._metadataCollection = new App.Collection.Metadata.Scope();
    this._metadataCatalog = new App.Collection.Metadata.Catalog();
  }

  /**
   * Initialize all data about metadata
   *
   * @param {Function} cb - callback function
   */
  metadata.prototype.start = function (cb) {

    // Get data about 'scopes'
    this._metadataCollection.fetch(
      {
        reset: true,
        success: function (collection) {
          return typeof cb === 'function'
            ? cb(collection)
            : collection;
        },
        error: function () {
          console.error('Cannot get metadata variables');
        }
      }
    );
  }

  /**
   * Get all data about current scope (scope_id)
   *
   * @param {String} scope_id - identification current scope
   * @param {Function} cb - callback function
   * @return {Function | Object} callback function or Object
   */
  metadata.prototype.getScope = function (scope_id, cb) {
    var scope = this._metadataCollection.get(scope_id);

    // If we didn't look for the current scope into
    // the collection, we will try other way to get it
    if (!scope) {
      this._metadataCollection
        .where({ multi: true })
        .find(function (parent) {
          scope = parent.get('childs').get(scope_id);
          return scope;
        });
    }

    // If scope doesn't found in the collection
    // we get all data from server
    if (scope === undefined) {
      var _this = this;
      scope = new App.Model.Metadata.Scope({ id: scope_id })
        .fetch({
          success: function (scope) {
            _this._metadataCollection.push(scope);
            if (cb) cb();
          },
          error: function (e) {
            var err = new Error('Something went wrong fetching scope');
            throw err;
          }
        });
    }

    return typeof cb === 'function'
      ? cb(scope)
      : scope;
  }

  /**
   * Get all data about current category (category_id)
   *
   * @param {String} category_id - identification current category
   * @return {Object} - current category
   */
  metadata.prototype.getCategory = function (category_id) {
    var result = this.getScope(App.currentScope)
      .get('categories')
      .get(category_id);

    return result ? result : null;
  }

  /**
   * Get all data about current entity (entity_id)
   *
   * @param {String} entity_id - identification current entity
   * @return {Object} - current entity
   */
  metadata.prototype.getEntity = function (entity_id) {
    var element;
    var result = this.getScope(App.currentScope)
      .get('categories')
      .find(function (cat) {
        element = cat.get('entities').get(entity_id);
        return element;
      });

    return result ? element : null;
  }

  /**
   * Get all data about current variable (variable_id)
   *
   * @param {String} variable_id - identification current entity
   * @return {Object} - current variable
   */
  metadata.prototype.getVariable = function (variable_id) {
    // TODO: Remove this hack (usado en "irrigation" y "watering")
    if (variable_id == 'seconds') {
      return new Backbone.Model({
        id: 'seconds',
        name: 'Tiempo de encendido',
        units: 'minutos',
        var_agg: ['SUM', 'MAX', 'AVG', 'MIN']
      });
    }

    var element;
    var result = this.getScope(App.currentScope)
      .get('categories')
      .any(function (cat) {
        var temp = cat.get('entities')
          .find(function (ent) {
            return ent.get('variables').get(variable_id);
          });
        if (temp) {
          element = temp.get('variables').get(variable_id);
        }
        return temp;
      });
    return result ? element : null;
  }

  /**
   * Get collection about catalog
   *
   * @return {Array} - collection catalog
   */
  metadata.prototype.getCatalog = function () {
    return this._metadataCatalog;
  };

  /**
   * Set collection into '_metadataCatalog'
   * @param {Array} catalog - catalog to save
   */
  metadata.prototype.setCatalog = function (catalog) {
    this._metadataCatalog = catalog;
  }

  /**
   * Get category's catalog
   *
   * @param {String} category_id - identification catalog
   * @return {Array} - collection catalog
   */
  metadata.prototype.getCatalogCategory = function (category_id) {
    var result = this._metadataCatalog.get(category_id);
    return result ? result : null;
  };

  /**
   * Get entity's catalog
   *
   * @param {String} entity_id - identification entity
   * @return {Object}
   */
  metadata.prototype.getCatalogEntity = function (entity_id) {
    var element;
    var result = this._metadataCatalog
      .find(function (cat) {
        element = cat.get('entities').get(entity_id);
        return element;
      });

    return result ? element : null;
  }

  /**
   * Get variable's catalog
   *
   * @param {String} variable_id - identification variable
   * @return {Object}
   */
  metadata.prototype.getCatalogVariable = function (variable_id) {
    var element;
    var result = this._metadataCatalog
      .any(function (cat) {
        var temp = cat
          .get('entities')
          .find(function (ent) {
            return ent.get('variables').get(variable_id);
          });

        if (temp) {
          element = temp.get('variables').get(variable_id);
        }
        return temp;
      });

    return result ? element : null;
  }

  metadata.prototype._additionalInfoCatalog = {
    'frames': { colour: '#00b8c7', icon: 'SC_ic_embed_white.svg' },
    'correlations': { colour: '#00b8c7', icon: 'SC_ic_correlacion_white.svg' }
  };

  metadata.prototype.getAdditionalInfo = function (id) {
    var key = id.toLowerCase();
    var additionalInfo = {
      id: id,
      colour: '#00b8c7'
    };

    var specificInfo = this._additionalInfoCatalog[key] || false;
    if (specificInfo) {
      additionalInfo = Object.assign(additionalInfo, specificInfo);
    }

    return additionalInfo;
  }

  metadata.prototype.createScope = function (data, options) {
    var scopeModel = new App.Model.Metadata.Scope(data, {
      collection: this._metadataCollection,
    });
    var _this = this;
    scopeModel.save(null, {
      success: function () {
        _this._metadataCollection.push(scopeModel);
        options.success(scopeModel);
      },
      error: function (err) {
        options.error(err);
      }
    });
  }

  /**
   * Check if the indicated parameters exists in the "metadatas"
   * 
   * @param {Object} elements - Object with associated variables
   * @return {Boolean} - Exist parameter?
   */
  metadata.prototype.validateInMetadata = function (elements) {
    var validateMetadata = [];
    var FnMetadata = {
      categories: this.getCategory,
      entities: this.getEntity,
      variables: this.getVariable
    }

    _.each(FnMetadata, function (fn, key) {
      // Check if exist "property" and function
      if (elements.hasOwnProperty(key)) {
        var parameters = Array.isArray(elements[key])
          ? elements[key]
          : [elements[key]];
        // Check each parameter
        _.each(parameters, function (parameter) {
          var result = fn.apply(this, [parameter])
            ? true
            : false;

          validateMetadata.push(result);
        }.bind(this));
      }
    }.bind(this));

    return validateMetadata.length === 0
      ? false
      : _.every(validateMetadata, function (validation) {
        return validation;
      });
  }

  metadata.prototype.removeScope = function (scope_id, cb, parentScope) {
    cb = cb || null;
    var deletedScope;
    if (!parentScope)
      deletedScope = this._metadataCollection.remove(scope_id);
    else
      deletedScope = parentScope.get('childs').remove(scope_id);
    deletedScope.destroy({ success: cb });
  }

  metadata.prototype._entitiesMetadata = {}

  metadata.prototype.getEntityMetadata = function (id_entity) {
    return this._entitiesMetadata[id_entity] || {};
  }

  // To use this Object in other sides from the application,
  // we wrap it into 'App.Metadata'
  App.Metadata = metadata;

})()
