'use strict';

// API only offers POST and DELETE

/* POST
	- body:
		{
			"id": "<id_entity>",
			"name" : "Entity name",
			"id_category": "id_category",
			"table": "DB Table",
		}
*/

/* DELETE
	- parameter: id_entity
*/
App.Collection.Metadata.Entity = Backbone.Collection.extend({

	model: App.Model.Metadata.Entity,

	url: function(){
		return App.config.api_url + '/scopes/' + this.options.id_scope + '/entities';
	},

	initialize: function(models, options) {
		this.options = {
			id_scope: options.id_scope || ''
		};
	},
});
