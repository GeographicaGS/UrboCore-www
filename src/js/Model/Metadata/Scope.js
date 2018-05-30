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

App.Model.Metadata.Scope = Backbone.Model.extend({
  /*
  {
    id: '',
    name: '',
    location: [],
    zoom: 0,
    multi: false,
    parent_id: '',
    categories: Collection[ App.Model.Metadata.Category ]
  }
  */

  urlRoot: function(){
    var url;
    if( App.mode==='embed'){
      url = App.config.api_url + '/scopes';
    }
    else if(App.mode==='standard' && !App.auth.getUser().superadmin) {
      url = App.config.api_url + '/scopes';
    }
    else {
      url = App.config.api_url + '/admin/scopes';
    }
    return url;

  },

  initialize: function(model, options) {
    // // this.options = options;
    var categories;
    if(!model.multi) {
      categories = new App.Collection.Metadata.Category(model.metadata, {
        id_scope: this.get('id')
      })
    } else {
      // If scope is 'Multi scope' we need to create a fake Collection of 
      // categories using the id. If not, categories icon would be empty at HOME
      categories = new App.Collection.Metadata.Category(
        _.map(model.categories, function(c) {
          return { id: c }
        }), {id_scope: this.get('id')
      });
    }

    this.set({
      categories: categories
    });
  },

  parse: function(data, opts) {
    
    if(opts.parse === false) return this.attributes;

    var scope = {
      id: data.id,
      name: data.name,
      location: data.location,
      zoom: data.zoom,
      multi: data.multi,
      parent_id: data.parent_id,
      users: data.users,
      dbschema: data.dbschema || '',
      status: data.status || 0,
      frames: data.frames,
      categories: data.categories
    };

    if(data.childs && data.childs.length){
      scope.childs = new App.Collection.Metadata.Scope(data.childs, {
        parse: true,
        id_scope: data.id
      });
    }

    return scope;
  },

  addCategory: function(category_id){

    var category = App.mv().getCatalogCategory(category_id);
    var categoryObj = category.toJSON();
    categoryObj.entities = [];
    var categoryModel = new App.Model.Metadata.Category(categoryObj, {
      collection: this.get('categories'),
      id_scope: this.get('id'),
      parse: true
    });
    categoryModel.save(null,{ type:'POST', parse: false });
    this.get('categories').push(categoryModel);
  },

  removeCategory: function(category_id){
    var categoryModel = this.get('categories').remove(category_id);
    categoryModel.destroy({ url: categoryModel.url() + '/' + category_id });
  },
});
