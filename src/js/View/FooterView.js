'use strict';

App.View.FooterView = Backbone.View.extend({
  _template: _.template( $('#footer_template').html() ),

  render: function(){

   this.$el.html(this._template());
    return this;
  }
});
