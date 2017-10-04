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

App.View.Admin.Variable = Backbone.View.extend({
  _template: _.template( $('#admin-variable_template').html() ),

  events: {
    'click ul.entities .varListToggle': '_toggleVariableList',
    'click input[readonly="readonly"]': '_makeEditable',
    'blur input': '_save',
    'click .button.permission': '_showVariablePermissionPopup',
  },

  initialize: function(options){
    this.scope = options.scope;
    this.category = options.category;
    this.entity = options.entity;
    this.variable = options.variable;

    _.bindAll(this, 'render');
    this.model = App.mv().getVariable(this.variable);
    this.categoryModel = App.mv().getCategory(this.category);
    this.entityModel = App.mv().getEntity(this.entity);
    this.scopeModel = App.mv().getScope(this.scope);

    App.getNavBar().set({
      visible : true,
      scopeInfo: {
        visible: false
      },
      breadcrumb : [
      {
        url: 'admin/scope/' + this.scope + '/' + this.category + '/' + this.variable,
        title : this.model.get('name')
      },
      {
        url: 'admin/scope/' + this.scope + '/' + this.category,
        title : this.categoryModel.get('name')
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
    this.render();
  },

  render: function(){
    this.$el.html(this._template({
      scope: {name: this.scope, id: this.scope},
      category: {name: this.categoryModel.get('name'), id: this.category},
      entity: {name: this.entityModel.get('name'), id: this.entity},
      variable: this.model.toJSON()
    }));

    return this;
  },

  _toggleVariableList: function(e){
    e.preventDefault();

    $(e.currentTarget).parents('li').children('.list').toggleClass('collapsed');
  },

  _makeEditable: function(e){
    e.preventDefault();
    e.currentTarget.removeAttribute('readonly');
  },

  _save: function(e){
    e.preventDefault();
    e.currentTarget.setAttribute('readonly','readonly');
    if(e.currentTarget.id === 'good-high'){
      this.$('#warning-low').val(e.currentTarget.value);
    }else if(e.currentTarget.id === 'warning-high'){
      this.$('#alert').val(e.currentTarget.value);
    }

    var thresholds = this.model.get('var_thresholds');
    if (thresholds.length > 1) {
      thresholds[1] = parseInt(this.$('#good-high').val());
      thresholds[2] = parseInt(this.$('#warning-high').val());
    } else {
      thresholds[0] = parseInt(this.$('#good-high').val());
    }

    this.model.set({
      var_thresholds: thresholds
    });
    this.model.save(null,{url: this.model.url() + '/' + this.model.get('id')});
  },

  _showVariablePermissionPopup: function(e){
    e.preventDefault();

    var id_resource = $(e.currentTarget).data('variable');
    var permissionData = {
      id_scope: this.scope,
      id_resource: id_resource,
      type_resource: __('Variable'),
      name_resource: this.model.get('name')
    };
    // if(this.scopeModel.get('parent_id') && this.scopeModel.get('parent_id') !== 'orphan'){
    //   permissionData.id_scope = this.scopeModel.get('parent_id');
    // }
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

});
