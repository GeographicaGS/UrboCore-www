'use strict';

// API only offers POST and DELETE

/* POST
	- body:
		{
			"id": "waste_d",
			"name": "Residuos"
		}
*/

/* DELETE
	- parameter: id_category
*/
App.Collection.Metadata.Category = Backbone.Collection.extend({

	model: App.Model.Metadata.Category,

	url: function(){
    return App.config.api_url + '/scopes/' + this.options.id_scope + '/metadata';
	},

	initialize: function(models, options) {

		this.options = {
			id_scope: options.id_scope || ''
		};
	},

	fetch: function(options){
		var options = options || {};
		options.id_scope = this.options.id_scope;

		Backbone.Collection.prototype.fetch.call(this,options);
	},

	parse: function(data, opts){
		if(data && data.length > 0 && typeof data[0] === 'string'){
			var parsedData = [];
			_.each(data, function(el){
				parsedData.push({id: el});
			});
			return parsedData;
		}else{
			return data;
		}
	}
});
