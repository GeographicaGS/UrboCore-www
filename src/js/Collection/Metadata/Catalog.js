'use strict';

// API only offers GET

App.Collection.Metadata.Catalog = App.Collection.Metadata.Category.extend({

	url: function(){
		return App.config.api_url + '/metadata';
	},

	initialize: function(){
		this.options = {};
	}
});
