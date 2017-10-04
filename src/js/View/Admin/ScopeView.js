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

App.View.Admin.Scope = Backbone.View.extend({
  _template: _.template( $('#admin-scope_template').html() ),

  events: {
    'click input[readonly="readonly"]': '_makeEditable',
    'blur form.scopeInfo input': '_saveScope',
    // 'change select': '_saveScope',
    'click .button.publish': '_publishScope',
    'click .button.unpublish': '_unpublishScope',
    'change .listItem.category input[type=checkbox]': '_toggleCategory',
    'click .button.permission': '_showScopePermissionPopup',
    'click .button.delete': '_removeScope',
    'click .listItem.category .permission': '_showCategoryPermissionPopup',
    'click .listItem.scope .edit': '_gotoScope',
    'click .listItem.scope .remove': '_removeScope',
    'click .newScope': '_createScope',
  },

  initialize: function(options){
    this.scope = options.scope;
    this.model = App.mv().getScope(this.scope);
    this.catalog = App.mv().getCatalog();

    if(this.model.get('name') !== undefined){
      this.render();
    }else {
      var _this = this;
      this.model.fetch({
        success: function(){
          _this.render();
        }
      })
    }
  },

  render: function(){
    var breadcrumb = [{
      url: 'admin/scope/' + this.scope,
      title : this.model.get('name')
    }];
    var backUrl;
    if(this.model.get('parent_id') && this.model.get('parent_id') !== 'orphan'){
      var parentScope = App.mv().getScope(this.model.get('parent_id'));
      if(parentScope){
        breadcrumb.push({
          url: 'admin/scope/' + parentScope.get('id'),
          title : parentScope.get('name')
        });
        backUrl = 'admin/scope/' + parentScope.get('id');
      }
    }else{
      backUrl = 'admin/scopes';
    }
    breadcrumb.push({
      url: 'admin/scopes',
      title : __('Ámbitos')
    });
    App.getNavBar().set({
      visible : true,
      scopeInfo: {
        visible: false
      },
      breadcrumb : breadcrumb,
      backurl: backUrl,
      menu: {
        showable: false
      }
    });

    this.$el.html(this._template({
      scope: this.model.toJSON(),
      catalog: this.catalog
    }));

    return this;
  },

  _makeEditable: function(e){
    e.preventDefault();
    e.currentTarget.removeAttribute('readonly');
  },

  _saveScope: function(e){
    e.preventDefault();
    var $target = $(e.currentTarget);
    var data = {};
    if($target.attr('id') === 'lat' || $target.attr('id') === 'lon'){
      data = {
        location: [
          this.$('#lat').val(),
          this.$('#lon').val(),
        ]
      };
    }else{
      data[$target.attr('id')] = $target.val();
    }

    this.model.set(data);
    this.model.save(null,{
      success: function(){
        $target.removeClass('error').attr('readonly','readonly');
      },
      error: function(){
        $target.addClass('error');
      },
      parse: false
    });

  },

  _publishScope: function(e){
    e.preventDefault();
    $(e.currentTarget).html('...');
    this._savePublishStatus(1);
  },

  _unpublishScope: function(e){
    e.preventDefault();
    $(e.currentTarget).html('...');
    this._savePublishStatus(0);
  },

  _savePublishStatus: function(status) {
    var data = {
      status: status
    };
    var _this = this;
    this.model.set(data);
    this.model.save(null,{
      success: function(){
        _this.render();
      },
      error: function(data, xhr, error){
        // TODO: Needed while server responses with text, a 200 code is enough
        if(xhr.status === 200){
          _this.render();
        }
      },
      parse: false
    });
  },

  _toggleCategory: function(e){
    e.preventDefault();
    var categoryId = $(e.currentTarget).parent().data('category');
    if(e.currentTarget.checked){
      // Add category
      this.model.addCategory(categoryId);
      App.mv().start();
    }else{
      // Remove category
      if(window.confirm(__('¿Estás seguro de eliminar este vertical?\nSe perderán todas las configuraciones de este vertical.'))){
        this.model.removeCategory(categoryId);
      }else{
        e.currentTarget.checked = true;
      }
    }
  },

  _showScopePermissionPopup: function(e){
    e.preventDefault();

    var permissionData = {};
    // if(!this.model.get('parent_id') || this.model.get('parent_id') === 'orphan'){
      permissionData = {
        id_scope: this.scope,
        type_resource: __('Ámbito'),
        name_resource: this.model.get('name')
      };
    // }else{
    //   permissionData = {
    //     id_scope: this.model.get('parent_id'),
    //     id_resource: this.scope,
    //     type_resource: 'Ámbito',
    //     name_resource: this.model.get('name')
    //   };
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

  _showCategoryPermissionPopup: function(e){
    e.preventDefault();

    var id_category = $(e.currentTarget).parent().data('category');
    var permissionData = {
      id_scope: this.scope,
      id_resource: id_category,
      type_resource: __('Vertical'),
      name_resource: this.model.get('categories').get(id_category).get('name')
    };

    // if(this.model.get('parent_id') && this.model.get('parent_id') !== 'orphan'){
    //   permissionData.id_scope = this.model.get('parent_id');
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

  _createScope: function(e) {
    e.preventDefault();

    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    var createScopeView = new App.View.Admin.ScopeCreate({parentScope: this.scope});
    this._popUpView.internalView = createScopeView;

    this.$el.append(this._popUpView.render().$el);

    this.listenTo(createScopeView, 'close', this._onCreateScopeClosed);

    this._popUpView.show();
  },

  _onCreateScopeClosed: function(e){
    this._popUpView.closePopUp();
    var _this = this;
    this.model.fetch({success: function(){
      if(e.data && e.data.id){
        App.router.navigate('/admin/scope/' + e.data.id, {trigger: true});
      }else{
        _this.render();
      }
    }});
  },

  _gotoScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope'] ? e.currentTarget.attributes['data-scope'].value : '';
    if(scopeId){
      App.router.navigate('/admin/scope/' + scopeId, {trigger: true});
    }
  },

  _removeScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope'] ? e.currentTarget.attributes['data-scope'].value : '';
    if(scopeId){
      if(window.confirm(__('¿Estás seguro de eliminar este ámbito?\nSe perderán todas las configuraciones de este ámbito.'))){
        var _this = this;
        App.mv().removeScope(
          scopeId,
          function(){
            if(scopeId !== _this.model.get('id')){
              _this.model.fetch({ success: function(){ _this.render(); }});
            }else{
              // navigate back
              App.router.navigate('/admin/scopes', { trigger: true });
            }
          },
          scopeId !== this.model.get('id') ? this.model : undefined
        );
      }
    }
  }

});
