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
