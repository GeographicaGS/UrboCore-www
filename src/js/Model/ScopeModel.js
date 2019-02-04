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

'use strict';

App.Model.Scope = Backbone.Model.extend({

  // Defaults value model
  defaults: {
    id: null,
    name: null,
    location: [],
    multi: null,
    zoom: null
  },

  initialize: function(options) {
    this.options = options || {};
    if (this.options.id) {
      this.set({
        categories: App.Collection.ScopeMetadata({id_scope: options.id}).fetch()
      });
    }
  },

  url: App.config.api_url + '/scopes',

  /**
   * Validations to model fields
   * 
   * @param {Object} fields - differents model fields
   * @return {Array | Boolean} - Array with errors or always is fine (without errors)
   */  
  validate: function(fields) {
    var errors = [];

    // 'name' field
    if (fields.name.length < 3) {
      errors.push({ 
        name: 'name',
        msg: __('El campo no puede tener menos de 3 caracteres')
      });
    }

    if (fields.multi === false) {
      // 'location' field
      var regFloat = new RegExp('^[-+]?[0-9]*\.?[0-9]+$'); //Float number
      if (fields.location.length !== 2
        || !regFloat.test(fields.location[0])
        || !regFloat.test(fields.location[1])) {
        errors.push({ 
          name: 'location',
          msg: __('Los valores no son correctos')
        });
      }

      // 'zoom' field
      var regInteger = new RegExp('^[0-9]+$'); //Integer number
      if (!regInteger.test(fields.zoom)
        || parseInt(fields.zoom, 10) < 0
        || parseInt(fields.zoom, 10) > 16) {
        errors.push({ 
          name: 'zoom',
          msg: __('Debes indicar un número entero entre 0 y 16')
        });
      }
    }

    return errors.length > 0 ? errors : false;
  }

});
