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
			"id": "<id_entity>",
			"name" : "Entity name",
			"id_category": "id_category",
			"table": "DB Table",
		}
*/

/* DELETE
	- parameter: id_entity
*/
App.Model.Metadata.Entity = Backbone.Model.extend({

	url: function(){
		return App.config.api_url + '/admin/scopes/' + this.options.id_scope + '/entities';
	},

	initialize: function(model, options) {
		this.options = {
			id_scope: options.id_scope || ''
		};
		this.set({
			variables: new App.Collection.Metadata.Variable(model.variables, {
				id_scope: this.options.id_scope
			})
		});
	},

	parse: function(data, opts) {
    if(opts.parse === false) return this.attributes;

		return {
			id: data.id,
			id_category: data.id_category,
			name: data.name,
			table: data.table,
			mandatory: data.mandatory,
			editable: data.editable,
			variables: new App.Collection.Metadata.Variable(data.variables, {
				parse: true,
				id_scope: opts.id_scope
			})
		}
	},

	addVariable: function(variable_id){
	  var variable = App.mv().getCatalogVariable(variable_id);
	  var variableModel = new App.Model.Metadata.Variable(variable.toJSON(), {
	    collection: this.get('variables'),
	    id_scope: this.options.id_scope
	  });
	  variableModel.save(null,{ type:'POST' });
	  this.get('variables').push(variableModel);
	},

  removeVariable: function(variable_id){
    var variableModel = this.get('variables').remove(variable_id);
    variableModel.destroy({ url: variableModel.url() + '/' + variable_id });
  },
});
