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

App.View.Modal = Backbone.View.extend({

  attributes: {
    modalTitle: __('Información'), // Modal title
    modalClass: '', // Class css apply to modal wrapper
    modalContent: '', // Modal content, can be String or Backbone View
    isContentBackboneView: false, // Is Content a Backbone View?,
    parentModal: 'body', // Is the DOM element where the Modal will be append,
    showModalHeader: true, // Show header modal with the title and cross image
    showModalFooter: true, // Show footer modal with the actions buttons
    showModalButtonOk: true, // Show action 'OK' button
    showModalButtonCancel: true,// Show action 'Cancel' button
  },

  template: _.template($('#modal_template').html()),

  initialize: function(options) {
    this.attributes = Object.assign({}, this.attributes, options || {});
    _.bindAll(this, 'render');
    this.render();
  },

  events: {
    'click .overlay, .close-modal' : 'closeModal',
    'click #buttonCancel' : 'onButtonCancel',
    'click #buttonOk' : 'onButtonOk'
  },

  /**
   * Draw the Modal in the DOM
   */
  render: function() {
    this.attributes.isContentBackboneView = typeof this.attributes.modalContent === 'object'
      && typeof this.attributes.modalContent.render === 'function'

    // Append in the DOM
    $(this.attributes.parentModal).append(
      this.$el.html(this.template(this.attributes))
    );

    // If the content is an 'Backbone.View' Object
    if (this.attributes.isContentBackboneView) {
      this.$('.app-modal-content').append(this.attributes.modalContent.render().$el);
    }

    return this;
  },

  /**
   * Push on "cancel" button
   * 
   * @param {Object} e - event triggered
   */
  onButtonOk: function (e) {
    // We create a global event
    App.events.trigger('modal:click:ok', e);
    this.closeModal(e);
  },

  /**
   * Push on "cancel" button
   * 
   * @param {Object} e - event triggered
   */
  onButtonCancel: function (e) {
    // We create a global event
    App.events.trigger('modal:click:cancel', e);
    this.closeModal(e);
  },

  /**
   * Close modal and remove and destroy any
   * associated event to it
   * 
   * @param {*} e - event triggered
   */
  closeModal: function(e) {
    e.preventDefault();
    // Remove the Backbone View from DOM and every
    // associated events to it
    if (this.attributes.isContentBackboneView) {
      this.attributes.modalContent.close();
    }
    this.close();
    // We create a global event
    App.events.trigger('modal:close', e);
  }
});

App.View.PopUp = Backbone.View.extend({

  _template: _.template( $('#pop_up_template').html() ),

  defaults: {
    model: new Backbone.Model()
  },

  //Parametros aceptados en el modelo:
  //--classModal: Nombre de la clase CSS que aplica al elemento '.modal' de la template del popup
  // initialize: function(options) {
  //   var options = options || {};
  //   this.model = options.model ? options.model : new Backbone.Model();
  // },

  events: {
    "click .overlay" : "closePopUp",
    "click .exitButton img" : "closePopUp"
  },

  render: function() {
    var templateData = { m: {} };
    if(this.model)
      templateData.m = this.model.toJSON();
    this.$el.html(this._template(templateData));
    if(this.internalView != undefined) {
      // var internalView = this.internalView;
      this.$el.find(".modalContent").html(this.internalView.render().$el);
    }
    return this;
  },

  show: function() {
    this.$(".modal").show();
    this.$(".overlay").show();
  },

  closePopUp: function(ev) {
    if(ev != undefined) {
      ev.preventDefault();
    }
    this.$el.html("");

    if(this.internalView != undefined) {
      this.internalView.close();
    }
  },

  onClose: function() {
    this.stopListening();

    if(this.internalView != undefined) {
      this.internalView.close();
    }
  }

});


App.View.PopUpPublish = Backbone.View.extend({

  _template: _.template( $('#pop_up_publish_template').html() ),

  defaults: {
    model: new Backbone.Model()
  },

  //Parametros aceptados en el modelo:
  //--classModal: Nombre de la clase CSS que aplica al elemento '.modal' de la template del popup
  // initialize: function(options) {
  //   var options = options || {};
  //   this.model = options.model ? options.model : new Backbone.Model();
  // },

  events: {
    "click .overlay" : "closePopUp",
    "click .exitText" : "closePopUp"
  },

  render: function() {
    var templateData = { m: {} };
    if(this.model)
      templateData.m = this.model.toJSON();
    this.$el.html(this._template(templateData));
    if(this.internalView != undefined) {
      // var internalView = this.internalView;
      this.$el.find(".modalContent").html(this.internalView.render().$el);
    }
    return this;
  },

  show: function() {
    this.$(".pmodal").show();
    this.$(".overlay").show();
  },

  closePopUp: function(ev) {
    if(ev != undefined) {
      ev.preventDefault();
    }
    this.$el.html("");

    if(this.internalView != undefined) {
      this.internalView.close();
    }
  },

  onClose: function() {
    this.stopListening();

    if(this.internalView != undefined) {
      this.internalView.close();
    }
    Backbone.trigger('modal:close');
  }

});
