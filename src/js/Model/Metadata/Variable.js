'use strict';

// API only offers POST, PUT and DELETE

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
App.Model.Metadata.Variable = Backbone.Model.extend({
  defaults: {
    id_entity: '',
    name: '',
    units: '',
    var_thresholds: [],
    var_agg: [],
    mandatory: false,
    reverse: false,
  },

	url: function(){
		return App.config.api_url + '/admin/scopes/' + this.options.id_scope + '/variables';
	},

	initialize: function(model, options) {
		this.options = {
			id_scope: options.id_scope || ''
		};
	},
});
