App.Collection.DynamicLegend = Backbone.Collection.extend({
  initialize: function(models,options){
    this.options = options;
    this.listenTo(App.ctx, 'change:start change:finish change:bbox', this.fetch);
  },
  url: function(){
    return App.config.api_url + '/' + this.options.scope + '/' + this.options.vertical + '/' + this.options.map + '/legend';
  },
  fetch: function(params){
    var options = {
			reset: true,
			data: {}
		};
    _.extend(options, params.data);

    var date = App.ctx.getDateRange();
    options['data'] = {
      'start': date.start,
      'finish': date.finish
    };

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
