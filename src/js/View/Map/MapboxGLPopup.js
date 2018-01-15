'use strict';

App.View.Map.MapboxGLPopup = Backbone.View.extend({
  initialize: function(template) {
    this._template = _.template($(template).html());
  }
});
