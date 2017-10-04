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
