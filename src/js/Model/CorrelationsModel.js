'use strict';

App.Model.Correlations = Backbone.Model.extend({
  initialize: function(options) {
    this.options = options;
  },
  urlRoot: function() {
    return App.config.api_url + '/scopes/' + this.options.scope;
  }
});
