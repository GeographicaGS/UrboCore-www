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

App.View.Admin.Category = Backbone.View.extend({
  _template: _.template( $('#admin-category_template').html() ),

  events: {
    'change .listItem.entity > input[type=checkbox]': '_toggleVariableList',
    'change .listItem.variable > input[type=checkbox]': '_toggleVariable',
    'click .listItem.entity > .permission': '_showEntityPermissionPopup',
    'click .listItem.variable > .permission': '_showVariablePermissionPopup',
    'click .button.permission': '_showCategoryPermissionPopup',
    'click .button.downloadConfig': '_downloadConfig',    
  },

  initialize: function(options){
    var _this = this;
    this.scope = options.scope;
    this.category = options.category;

    _.bindAll(this, 'render');
    this.model = App.mv().getCategory(this.category);
    this.scopeModel = App.mv().getScope(this.scope);

    App.getNavBar().set({
      visible : true,
      scopeInfo: {
        visible: false
      },
      breadcrumb : [{
        url: 'admin/scope/' + this.scope + '/' + this.category,
        title : this.model.get('name')
      },
      {
        url: 'admin/scope/' + this.scope,
        title : this.scopeModel.get('name')
      },
      {
        url: 'admin/scopes',
        title : __('Ámbitos')
      }],
      menu: {
        showable: false
      }
    });

    if (!App.mv().getCatalog().fetched) {
      App.mv().getCatalog().fetch({success: function(response) {
        App.mv().setCatalog(response);
        _this.catalog = App.mv().getCatalogCategory(_this.category);
        _this.render();
      }})
    } else {
      this.catalog = App.mv().getCatalogCategory(this.category);
      this.render();
    }
  },

  render: function(){
    this.$el.html(this._template({
      scope: {name: this.scope, id: this.scope},
      category: this.model.toJSON(),
      hasConnector: this.catalog.get('config').connector || 7, //TODO: HARDCODED
      catalog: this.catalog
    }));

    this.$('.listItem.entity > input[type=checkbox]:checked').each(function(idx, el){
      $(el).parent().siblings('ul.list').removeClass('collapsed');
    });

    return this;
  },

  _toggleVariableList: function(e){
    e.preventDefault();
    var entityId = $(e.currentTarget).parent().data('entity');
    var mandatory = $(e.currentTarget).parent().data('mandatory');
    if(!mandatory){
      if(e.currentTarget.checked){
        $(e.currentTarget).parents('li').children('.list').removeClass('collapsed');
        // Add entity
        this.model.addEntity(entityId);
      }else{
        if(window.confirm('¿Estás seguro de eliminar esta entidad?\nSe perderán todas las configuraciones de esta entidad.')){
          $(e.currentTarget).parents('li').children('.list').addClass('collapsed');
          // Remove entity
          this.model.removeEntity(entityId);
        }else{
          e.currentTarget.checked = true;
        }
      }
    }
    else {
      // Always checked
      e.currentTarget.checked = true;
    }
  },

  _toggleVariable: function(e){
    e.preventDefault();
    var variableId = $(e.currentTarget).parent().data('variable');
    var entityId = $(e.currentTarget).parent().data('entity');
    var entityModel = App.mv().getEntity(entityId);

    var mandatory = $(e.currentTarget).parent().data('mandatory');
    if(!mandatory){
      if(e.currentTarget.checked){
        // Add variable
        entityModel.addVariable(variableId);
      } else {
        // Remove variable
        if(window.confirm('¿Estás seguro de eliminar esta variable?\nSe perderán todas las configuraciones de esta variable.')){
          entityModel.removeVariable(variableId);
        }else{
          e.currentTarget.checked = true;
        }
      }
    }
    else {
      // Always checked
      e.currentTarget.checked = true;
    }
  },

  _showCategoryPermissionPopup: function(e){
    e.preventDefault();

    var permissionData = {};

    permissionData = {
      id_scope: this.scope,
      type_resource: __('Ámbito'),
      name_resource: this.model.get('name')
    };

    var permissionView = new App.View.Admin.PermissionPopup(permissionData);

    if(this._popupView == undefined) {
      this._popupView = new App.View.PopUp();
    }
    this._popupView.internalView = permissionView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(permissionView, 'close', this._onPermissionPopupClose);

    this._popupView.show();
  },

  _showEntityPermissionPopup: function(e){
    e.preventDefault();

    var id_resource = $(e.currentTarget).parent().data('entity');
    var permissionData = {
      id_scope: this.scope,
      id_resource: id_resource,
      type_resource: __('Entidad'),
      name_resource: this.model.get('entities').get(id_resource).get('name')
    };
    var permissionView = new App.View.Admin.PermissionPopup(permissionData);

    if(this._popupView == undefined) {
      this._popupView = new App.View.PopUp();
    }
    this._popupView.internalView = permissionView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(permissionView, 'close', this._onPermissionPopupClose);

    this._popupView.show();
  },

  _showVariablePermissionPopup: function(e){
    e.preventDefault();

    var id_resource = $(e.currentTarget).parent().data('variable');
    var permissionData = {
      id_scope: this.scope,
      id_resource: id_resource,
      type_resource: __('Variable'),
    };
    var permissionView = new App.View.Admin.PermissionPopup(permissionData);

    if(this._popupView == undefined) {
      this._popupView = new App.View.PopUp();
    }
    this._popupView.internalView = permissionView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(permissionView, 'close', this._onPermissionPopupClose);

    this._popupView.show();
  },

  _onPermissionPopupClose: function(e){
    this._popupView.closePopUp();
  },

  _downloadConfig: function(e) {
    var configGenerator = new App.Model.ConnectorConfigGenerator({
      id_scope: this.scope,
      id_category: this.category
    });

    configGenerator.fetch({
      success: function() {
        debugger;
      },
      error: function() {
        window.alert(__('Hubo un error al intentar descargar el fichero de configuración'));
      }
    })
  },  

});
