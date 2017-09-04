App.Model.Variables = App.Model.Post.extend({
  url: function() {
    return App.config.api_url + '/' + this.options.scope + '/variables/' + this.options.variable + '/' + this.options.mode;
  }
});


App.Model.Variables.Outers = Backbone.Model.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function() {
    return App.config.api_url + '/' + this.options.scope + '/variables/' + this.options.variable + '/outers';
  },

  fetch: function(options) {
    if(!options || !options.data){
      options = options || {};
      options.data= {};
    }

    var date = App.ctx.getDateRange();
    options.data.start = date.start;
    options.data.finish = date.finish;
    options.data.agg = this.options.agg;

    return Backbone.Model.prototype.fetch.call(this, options);
  },

});
