'use strict';

App.Model.StatsUser = Backbone.Model.extend({
  // initialize: function(options) {
  //   this.options = options;
  //   this.set({
  //     categories: App.Collection.ScopeMetadata({id_scope: options.id}).fetch()
  //   });
  // },
  url: App.config.api_url + '/logs/pageviews',
});
