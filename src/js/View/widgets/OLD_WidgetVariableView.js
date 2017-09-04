'use strict';

App.View.WidgetVariable = App.View.Widgets.Base.extend({
  _template: _.template( $('#widgets-widget_variable_template').html() ),

  initialize: function(options) {
    this.render();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.setElement(this._template({
      'url': this.url,
      'title':this.title,
      'category_name': this.category_name
    }));
    var model = new Backbone.Model({
      botonLocationView:this.$(".botons"),
      tooltipIcon: __('Ahora')
    });
    this._renderRealTimeComponent(model);
    return this;
  }

});
