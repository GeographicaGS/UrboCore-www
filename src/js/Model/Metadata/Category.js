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
