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
    // this.options = options;
    var categories = new App.Collection.Metadata.Category(null, {
      id_scope: this.get('id')
    })

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
      frames: data.frames
    };

    if(!data.multi){
      scope.categories = new App.Collection.Metadata.Category(data.categories, {
        parse: true,
        id_scope: data.id
      });
    }else if(data.childs){
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
