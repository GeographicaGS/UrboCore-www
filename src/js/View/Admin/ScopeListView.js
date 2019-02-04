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

/**
 * Backbone.View that show the 'scopes' list
 * inside the Admin's routes
 */
App.View.Admin.ScopeList = Backbone.View.extend({
  _template: _.template( $('#admin-scope_list_template').html() ),

  events: {
    'click .newScope': 'onNewScope',
    'click .link': 'onGoToScope',
    'click .remove': 'onRemoveScope'
  },

  initialize: function(){
    this.collection = new App.Collection.Metadata.Scope();
    this.listenTo(this.collection, 'reset', this.render);
    this.collection.fetch( { reset: true });
  },

  render: function(){
    App.getNavBar().set({
      visible : false
    });

    this.$el.html(this._template({ scopes: App.Utils.toDeepJSON(this.collection) }));

    return this;
  },

  /**
   * Show the scope form inside from the modal
   * 
   * @param {Object} e - triggered event
   */
  onNewScope: function(e) {
    e.preventDefault();
    var scopeCreateView = new App.View.Admin.ScopeCreate();
    // Show modal
    var modalView = new App.View.Modal({
      modalTitle: __('Crear ámbito'),
      modalContent: scopeCreateView,
      showModalFooter: false
    });

    // The event trigger when the proccess is cancel
    this.listenTo(scopeCreateView, 'form:cancel', function (e) {
      modalView.closeModal.apply(modalView);
    });

    // The events trigger when the proccess is successfully finished
    this.listenTo(scopeCreateView, 'form:save', function (e) {
      this.handlerScopeCreated(e);
      modalView.closeModal.apply(modalView);
    }.bind(this));
  },

  /**
   * When the create or edit proccessis successfully finished
   * we trigger this function
   * 
   * @param {Object} e - triggered event
   */
  handlerScopeCreated: function(e) {
    if(e && e.data && e.data.id) {
      this.collection.fetch({
        success: function(){
          App.router.navigate('/admin/scope/' + e.data.id, { trigger: true });
        }
      });
    } else {
      this.collection.fetch({ reset: true });
    }
  },

  /**
   * Go to the scope detail page
   * 
   * @param {Object} e - triggered event 
   */
  onGoToScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope']
      ? e.currentTarget.attributes['data-scope'].value
      : '';

    if(scopeId){
      App.router.navigate('/admin/scope/' + scopeId, {trigger: true});
    }
  },

  /**
   * Remove a Scope from list
   * 
   * @param {object} e - triggered event
   */
  onRemoveScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope']
      ? e.currentTarget.attributes['data-scope'].value
      : '';

    if(scopeId){
      // Show modal
      var modalView = new App.View.Modal({
        modalContent: __('¿Estás seguro de eliminar este ámbito?\nSe perderán todas las configuraciones de este ámbito.')
      });

      // The event trigger when the user push on OK
      this.listenTo(modalView, 'modal:click:ok', function (e) {
        this.handlerRemoveScope(scopeId);
      }.bind(this));
    }
  },

  /**
   * Handler to remove scope from database
   * 
   * @param {String} scopeId - Scope to remove
   */
  handlerRemoveScope: function (scopeId) {
    var _this = this;
    App.mv().removeScope(scopeId, function() {
      _this.collection.fetch({ reset: true });
    });
  }
});
