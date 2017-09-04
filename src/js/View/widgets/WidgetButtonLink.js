'use strict';

/*
Parameters in model:
{
  'category': '',
  'title': '',
  'buttonLink': '',
  'buttonText': '',
  'isExternalLink': true || false,
  'icons': ['', ]
}
*/

App.View.Widgets.ButtonLink = Backbone.View.extend({
  _template: _.template( $('#widgets-widget_button_link_template').html() ),

  initialize: function(options) {
    this.render();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.setElement(this._template({ m: this.model.toJSON()}));
    this.$loading = this.$('.widget_loading');
    this.hideLoading();
    return this;
  },

  showLoading: function(){
    this.$loading.removeClass('hidden');
  },

  hideLoading: function(){
    this.$loading.addClass('hidden');
  }
});
