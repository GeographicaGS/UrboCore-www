// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

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
