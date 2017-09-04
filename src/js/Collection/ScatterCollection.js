App.Collection.Scatter = App.Collection.Post.extend({
  initialize: function(models,options) {
    this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope + '/' + this.options.entity_id + '/' + this.options.feature + '/scatter/' + this.options.mode;
  }

});
