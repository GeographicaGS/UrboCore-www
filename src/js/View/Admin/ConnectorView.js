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

App.View.Admin.ConnectorPopup = Backbone.View.extend({
  _template: _.template($('#admin-connector_template').html()),
  _formTemplate: _.template($('#admin-connectorform_template').html()),
  connectorTemplates: [],
  connectorTemplate: null,

  events: {
    'change #templateSelector': '_changeTemplate',
    'click .button.remove': '_removeUser',
    'click .button.save': '_saveAndExit',
    'click .button.cancel': '_cancelAndExit',
    'keyup input.search': '_filterUsers'
  },

  initialize: function(options){
    debugger;
    this.options = {
			id_scope: options.id_scope || '',
			id_resource: options.id_resource,
      type_resource: options.type_resource || '',
      name_resource: options.name_resource || '',
		};

    this.templatesCollection = new App.Collection.ConnectorTemplates();
    this.endpoints = new App.Collection.ConnectorEndpoints();
    this.instances = new App.Model.ConnectorInstance();
    this.templatesCollection.fetch({reset: true, appendAuthorizationConnector: true,  success: this._onTemplatesLoad.bind(this)});
  },

  render: function(){
    this.setElement(this._template({
      name: this.options.name_resource,
      templates: this.connectorTemplates
    }));
    return this;
  },

  _saveAndExit: function(e){
    e.preventDefault();
    var _this = this;
    _.each(this.$el.find('.endpoints-selector'), function(selector) {
      var path = $(selector).attr('data-path').replace('template.','').split('.');
      var original = App.Utils.objectPath(_this.connectorTemplate, path);
      if (original[1].associative) {
        var name = $('.endpoints-selector-name[data-path="template.' + path + '"]').val();
        var value = {};
        value[name] =  parseInt($(selector).val());
        App.Utils.objectPath(_this.connectorTemplate, path, value);
        
      } else {
        App.Utils.objectPath(_this.connectorTemplate, path, parseInt($(selector).val()));
      }
      
    });
    // Save
    var payload = {
      name: $('#connector-name').val(),
      template_id: this.templateId,
      config: this.connectorTemplate
    }
    this.instances.save(payload, {
      appendAuthorizationConnector: true,
      success: function(){
        _this.trigger('close', {});
      },
      failure: function(error){
        console.log('Error: ' + error);
      }
    });
  },

  _onTemplatesLoad: function(templates) {
    this.connectorTemplates = templates;
    this.$el.empty();
    this.$el.html((this._template({
      name: this.options.name_resource,
      templates: this.connectorTemplates.toJSON()
    })));
  },  

  _cancelAndExit: function(e) {
    e.preventDefault();
    this.trigger('close', {});
  },

  _changeTemplate: function(e) {
    var _this = this;
    var id = e.currentTarget.value;
    var connector = this.connectorTemplates.get(id);
    this.templateId = id;
    this.connectorTemplate = connector.get('template');

    this.endpoints.fetch({appendAuthorizationConnector: true, success: function(endpoints) {
      _.each(connector.get('blocks'), function(block) {
        var endpoint = endpoints.filter(function(e){return e.get('type') === block.def.type2});
        if (!block.endpoints) {
          block.endpoints = [];
        }
        block.endpoints = block.endpoints.concat(endpoint);
      });
      _this.$el.find('#connector-form').html(_this._formTemplate({
        blocks: connector.get('blocks')
      }))

    }})
  }
});
