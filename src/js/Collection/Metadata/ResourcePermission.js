'use strict';

// API only offers GET and PUT

/* GET
  - parameter: id_scope, resource_id
*/

/* PUT
	- parameter: id_scope, resource_id
  - body:
    {
      "add": [<user_id>,...],
      "rm": [<user_id>,...]
    }
*/
App.Collection.Metadata.ResourcePermission = Backbone.Collection.extend({

	url: function(){
		var url = App.config.api_url + '/admin/scopes/' + this.options.id_scope + '/permissions';
		url += this.options.id_resource ? '/' + this.options.id_resource : '';
		return url;
	},

	initialize: function(models, options) {
		this.options = {
			id_scope: options.id_scope || '',
			id_resource: options.id_resource
		};
	},

	fetch: function(options){
		var options = options || {};

		Backbone.Collection.prototype.fetch.call(this,options);
	},

	save: function(data, options){
		var options = options || {};
		options.url = this.url();
		options.error = function(xhr,error){
			if(xhr.status !== 200){
				options.failure();
			}else{
				options.success(error);
			}
		}
		var model = new Backbone.Model(data);
		Backbone.sync("update", model, options);
	}
});
