'use strict';

App.View.Error = Backbone.View.extend({
  _template: _.template( $('#error_template').html() ),

  initialize: function(options) {
    App.getNavBar().set({
      visible : false,
      breadcrumb : null
    });

    this.render();
  },

  render: function(){
    this.$el.html(this._template());
    return this;
  }
});
