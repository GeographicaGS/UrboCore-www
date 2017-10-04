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
  }

});
