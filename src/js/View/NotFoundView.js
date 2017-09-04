'use strict';

App.View.NotFound = Backbone.View.extend({
  _template: _.template( $('#notfound_template').html() ),

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
