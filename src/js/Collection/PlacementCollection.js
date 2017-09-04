App.Collection.Placement = Backbone.Collection.extend({
	initialize: function(models,options) {
    this.options = options;
  },

	// suffix: '',

	url: function(){
		return App.config.api_url + '/' + this.options.scope + '/' + this.options.entity_id + '/placements';
	}

});
