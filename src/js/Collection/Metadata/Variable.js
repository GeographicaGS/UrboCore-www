'use strict';

// API only offers PUT and DELETE

/* PUT
	- parameter: id_entity
	- body:
		{
			"id_entity": "id_entity",
			"name": "<var_name>",
			"units": "<var_units>",
			"var_thresholds": [],
			"var_agg": ["SUM","MAX","MIN","AVG"],
			"reverse": false
		}
*/

/* DELETE
	- parameter: id_entity
*/
App.Collection.Metadata.Variable = Backbone.Collection.extend({

	model: App.Model.Metadata.Variable,

	url: function(){
		return App.config.api_url + '/scopes/' + this.options.id_scope + '/variables';
	},

	initialize: function(models, options) {
		this.options = {
			id_scope: options.id_scope || ''
		};
	},
});
