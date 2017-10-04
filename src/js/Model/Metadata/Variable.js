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
