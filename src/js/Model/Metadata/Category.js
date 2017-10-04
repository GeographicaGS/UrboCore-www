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

App.Model.Metadata.Category = Backbone.Model.extend({

  url: function(){
    return App.config.api_url + '/admin/scopes/' + this.options.id_scope + '/categories';
  },

  initialize: function(model, options) {
    this.options = {
      id_scope: options.id_scope || ''
    };

    if(!this.has('entities'))
    this.set({
      entities: new App.Collection.Metadata.Entity(null, {
        id_scope: this.options.id_scope
      })
    });
  },

  parse: function(data, opts) {
    if(opts.parse === false) return this.attributes;

    return {
      id: data.id,
      name: data.name,
      entities: new App.Collection.Metadata.Entity(data.entities, {
        parse: true,
        id_scope: opts.id_scope
      }),
      config: data.config || {},
      nodata: data.nodata || false
    }
  },

  addEntity: function(entity_id){
    var entity = App.mv().getCatalogEntity(entity_id);
    var entityObj = entity.toJSON();
    entityObj.variables = [];
    var entityModel = new App.Model.Metadata.Entity(entityObj, {
      collection: this.get('entities'),
      id_scope: this.options.id_scope,
      parse: true
    });
    entityModel.save(null,{ type:'POST', parse: false });
    this.get('entities').push(entityModel);
  },

  removeEntity: function(entity_id){
    var entityModel = this.get('entities').remove(entity_id);
    entityModel.destroy({ url: entityModel.url() + '/' + entity_id });
  },
});
