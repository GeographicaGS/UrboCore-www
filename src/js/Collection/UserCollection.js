'use strict';

App.Collection.User = Backbone.Collection.extend({

	model : App.Model.User,

	initialize: function(models,options) {

  },

	url: function(){
		return App.config.api_url + '/' + 'users'
	},

  search : function(term){
		if(term == "") return this;

		var pattern = new RegExp(term,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get('name')) || pattern.test(data.get('surname')) || pattern.test(data.get('email'));
		}));
	}

});
