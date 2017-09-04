'use strict';

App.Collection.Deprecated.WidgetContext = Backbone.Collection.extend({

	url: App.config.api_url + '/',

	initialize: function(models,options) {
    Backbone.Collection.prototype.initialize.call(this,[models,options])
		if (options.url) this.url = options.url;
    this.options = options;
		this.options.data = this.options.data || {};
		this.listenTo(App.ctx, 'change:start change:finish change:bbox', this.fetch);
  },

  parse: function(response){
    return _.map(response, function(r){
      r.date_created = r.date_open || r.date_status;
      return r;
    });
  },

  fetch: function(params) {
		var options = {
			reset: true,
			data: this.options.data
		};
		_.extend(options, params);

		var date = App.ctx.getDateRange();
		options.data.start = date.start;
		options.data.finish = date.finish;
		if(this.options.format)
			options['data']['format'] = this.options.format

		if(App.ctx.get('bbox'))
			options['data']['bbox'] = App.ctx.get('bbox');

		return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
