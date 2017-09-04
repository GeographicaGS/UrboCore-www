'use strict';

App.View.WidgetVariableData = App.View.WidgetVariable.extend({
  _template_data: _.template( $('#widgets-widget_variable_data_template').html() ),
  
  initialize: function(options) {
    this.render();
  },

  onClose: function(){
    this.stopListening();        
  },

  render: function(){
    // App.View.WidgetVariable.prototype.render.call(this)
    this.setElement(this._template());
    this.$('.widget_content').append(this._template_data());
    $(this.el).addClass('mini');
    return this;
  }

});
