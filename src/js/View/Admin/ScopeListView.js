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

App.View.Admin.ScopeList = Backbone.View.extend({
  _template: _.template( $('#admin-scope_list_template').html() ),

  events: {
    'click .newScope': '_createScope',
    'click .link': '_gotoScope',
    'click .remove': '_removeScope'
  },

  initialize: function(){
    this.collection = new App.Collection.Metadata.Scope();
    this.listenTo(this.collection, 'reset', this.render);
    this.collection.fetch({reset: true});
    // this.collection = App.mv()._metadataCollection;
    // this.render();
  },

  render: function(){
    App.getNavBar().set({
      visible : false
    });

    this.$el.html(this._template({ scopes: App.Utils.toDeepJSON(this.collection) }));

    return this;
  },

  _createScope: function(e) {
    e.preventDefault();
    debugger
    var createScopeView = new App.View.Admin.ScopeCreate();

    var modalView = new App.View.Modal({
      modalTitle: __('Crear ámbito'),
      modalContent: createScopeView
    });

    // this.$el.append(this._popUpView.render().$el);
    // this._popUpView.toggle();

    this.listenTo(modalView, 'modal:close', this._onCreateScopeClosed);
    // Backbone.on('modal:close', this._onCreateScopeClosed, this);
  },

  _onCreateScopeClosed: function(e) {
    debugger
    if(e.data && e.data.id) {
      this.collection.fetch({
        success: function(){
          App.router.navigate('/admin/scope/' + e.data.id, {trigger: true});
        }
      });
    }else{
      this.collection.fetch({ reset: true });
    }
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
        App.mv().removeScope(scopeId, function(){ _this.collection.fetch({reset: true}); });
      }
    }
  }

});
