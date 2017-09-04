App.Collection.SearchMap = Backbone.Collection.extend({
	initialize: function(models,options) {
    this.options = options;
  },

	url: function(){
		return App.config.api_url + '/' + this.options.scope +'/entities/search'
	},

	fetch: function(options) {
		if(!options)
			options = {}

		options['data'] = {'entities':this.options.entities, 'term':this.options.term};

		if(this.options.limit)
			options['data']['limit'] = this.options.limit;

    return Backbone.Collection.prototype.fetch.call(this, options);
  }

});