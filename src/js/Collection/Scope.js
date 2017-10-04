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

App.Collection.MultiScope = Backbone.Collection.extend({

	url: App.config.api_url + '/scopes',

  initialize: function(models, options) {
		this.options = options;
  },

	fetch: function(options) {
		if(!options || !options.data){
			options = options || {};
      options.data= {};
    }
		if(this.options) {
			if(this.options.multi == 'todos') {
				this.options.multi = null;
			} else if(this.options.multi == 'unico') {
				this.options.multi = false;
			} else if(this.options.multi == 'multi') {
				this.options.multi = true;
			}
			options['data']['multi'] = this.options.multi;
		}

		return Backbone.Collection.prototype.fetch.call(this, options);
	},

	parse: function(responseEntry) {
		var response = responseEntry;
    var scopeOsuna = undefined;
    _.each(response, function(scope) {
      if(scope.id == 'osuna') {
        scopeOsuna = scope;
      }
    });
		// if(scopeOsuna != undefined) {
    // 	scopeOsuna.categories.push('waste_d');
		// }
    return response;
  }
});
