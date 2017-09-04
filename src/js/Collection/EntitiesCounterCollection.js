App.Collection.EntitiesCounterGeneric = Backbone.Collection.extend({
  default: {
    options: {
      id: '',
      scope: '',
      entity: ''
    }
  },

  initialize: function(model,options){
    if(!options || !options.scope || !options.entity){
      throw new Error('Counter needs scope and ID to initialize');
    }
    this.options = {
      scope: options.scope,
      entity: options.entity
    };
    this._ctx = App.ctx;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/entities/map/counters';
  },

  fetch: function(options) {
  	var options = options || {};

    options.data = {};
    if(this._ctx.get('bbox')){
      options.data.bbox = _.map(this._ctx.get('bbox'), function(e){
        return parseFloat(e);
      }).join();
    }
    options.data.entities = this.options.entity;
    // options.data = JSON.stringify(options.data);

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
