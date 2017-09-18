(function(){

  var metadata = function(){
    this._metadataCollection = new App.Collection.Metadata.Scope();
    this._metadataCatalog = new App.Collection.Metadata.Catalog();
	}

  metadata.prototype.start = function(cb){

    // Load *all* metadata before starting
    this._metadataCatalog.fetch();
  	this._metadataCollection.fetch({reset:true,
  		success:function(collection){
        var total = collection.length;
        var i = 0;
        collection.each(function(scope){
          scope.fetch({ success: function(scope){
            if(!scope.get('multi')){
              scope.get('categories').fetch({
                success: function(){
                  i++;
                  if(i >= total  && !History.started)
                    cb();
                }
              });
            }else{
              total += scope.get('childs').length - 1;
              if(scope.get('childs').length > 0){
                scope.get('childs').each(function(child){
                  child.fetch({
                    success: function(subscope){
                      subscope.get('categories').fetch({
                        success: function(){
                          i++;
                          if(i >= total  && !History.started)
                            if(cb)
                              cb();
                        }
                      });
                    }
                  });
                });
              }else{
                i++;
                if(i >= total  && !History.started)
                  cb();
              }
            }
          }});
        });
  		},
  		error:function(){
  			console.error('Cannot get metadata variables');
  		}
  	});
  }

  metadata.prototype.getScope = function(scope_id,cb){
    var scope = this._metadataCollection.get(scope_id);
    // If no scope found
    if(!scope){
      this._metadataCollection.where({multi: true}).find(function(parent){
        scope = parent.get('childs').get(scope_id);
        return scope;
      });
    }
    var error = function(e){
      var err = new Error('Something went wrong fetching scope');
      throw err;
    }
    if(scope === undefined){
      var _this = this;
      scope = new App.Model.Metadata.Scope({id: scope_id}).fetch({
        success: function(scope){
          scope.get('categories').fetch({
            success: function(){
              _this._metadataCollection.push(scope);
              if (cb) cb();
            },
            error: error
          });
        },
        error: error
      });

      //this._metadataCollection.push(scope);

    }
    return scope; // Should we return it as Model or JSON ?
  }

  metadata.prototype.getCategory = function(category_id){
    var result = this.getScope(App.currentScope).get('categories').get(category_id);
    return result ? result:null;
  }

  metadata.prototype.getEntity = function(entity_id){
    var element;
    var result = this.getScope(App.currentScope)
      .get('categories').find(function(cat){
        element = cat.get('entities').get(entity_id);
        return element;
      });
    return result ? element:null;
  }

  metadata.prototype.getVariable = function(variable_id){
    // TODO: Remove this hack
    if(variable_id == 'seconds'){
      return new Backbone.Model({
        'id':'seconds',
        'name':'Tiempo de encendido',
        'units':'minutos'
      });
    }

    var element;
    var result = this.getScope(App.currentScope)
      .get('categories').any(function(cat){
        var temp = cat.get('entities').find(function(ent){
          return ent.get('variables').get(variable_id);
        });
        if(temp)
          element = temp.get('variables').get(variable_id);
        return temp;
      });
    return result ? element:null;
  }

  metadata.prototype.getCatalog = function(){
    return this._metadataCatalog;
  };

  metadata.prototype.getCatalogCategory = function(category_id){
    var result = this._metadataCatalog.get(category_id);
    return result ? result:null;
  };

  metadata.prototype.getCatalogEntity = function(entity_id){
    var element;
    var result = this._metadataCatalog.find(function(cat){
      element = cat.get('entities').get(entity_id);
      return element;
    });
    return result ? element:null;
  }

  metadata.prototype.getCatalogVariable = function(variable_id){
    var element;
    var result = this._metadataCatalog.any(function(cat){
      var temp = cat.get('entities').find(function(ent){
        return ent.get('variables').get(variable_id);
      });
      if(temp)
        element = temp.get('variables').get(variable_id);
      return temp;
    });
    return result ? element:null;
  }

  metadata.prototype._additionalInfoCatalog = {
    'frames': { colour: '#00b8c7', icon: 'SC_ic_embed_white.svg' },
    'correlations': { colour: '#00b8c7', icon: 'SC_ic_correlacion_white.svg' }
  };

  metadata.prototype.getAdditionalInfo = function(id) {
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

  metadata.prototype.createScope = function(data, options){
    var scopeModel = new App.Model.Metadata.Scope(data, {
      collection: this._metadataCollection,
    });
    var _this = this;
    scopeModel.save(null,{
      success: function(){
        _this._metadataCollection.push(scopeModel);
        options.success(scopeModel);
      },
      error: function(err){
        options.error(err);
      }
    });
  }

  metadata.prototype.validateInMetadata = function(elements){

    var valid = true;
    if('categories' in elements){
      var categories = (typeof elements.categories !== 'object') ? elements.categories : [elements.categories];
      _.each(categories, (function(category){
        valid = valid && this.getCategory(category);
      }).bind(this));
    }

    if('entities' in elements){
      var entities = (typeof elements.entities !== 'object') ? elements.entities : [elements.entities];
      _.each(entities, (function(entity){
        valid = valid && this.getEntity(entity);
      }).bind(this));
    }

    if('variables' in elements){
      var variables = (typeof elements.variables !== 'object') ? elements.variables : [elements.variables];
      _.each(variables, (function(variable){
        valid = valid && this.getVariable(variable);
      }).bind(this));
    }
    return valid;

  }


  metadata.prototype.removeScope = function(scope_id, cb, parentScope){
    cb = cb || null;
    var deletedScope;
    if(!parentScope)
      deletedScope = this._metadataCollection.remove(scope_id);
    else
      deletedScope = parentScope.get('childs').remove(scope_id);
    deletedScope.destroy({success: cb});
  }

  metadata.prototype._entitiesMetadata = {
  }

  metadata.prototype.getEntityMetadata = function(id_entity){
    return this._entitiesMetadata[id_entity] || {};
  }

  App.Metadata = metadata;

})()
