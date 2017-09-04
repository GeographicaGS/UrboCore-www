'use strict';

App.Collection.Metadata.Scope = Backbone.Collection.extend({

	model: App.Model.Metadata.Scope,

	url: function(){

		var _superadmin = App.auth && App.auth.getUser() && App.auth.getUser().superadmin;

		if(_superadmin)
			return App.config.api_url + '/admin/scopes';
		else
			return App.config.api_url + '/scopes';
	},

	initialize: function(models, options) {
		this.options = options;
	},

	parse: function(data){

		return data;
	},
});
