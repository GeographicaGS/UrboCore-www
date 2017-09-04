'use strict';

App.Model.Scope = Backbone.Model.extend({
  initialize: function(options) {
    this.options = options;
    this.set({
      categories: App.Collection.ScopeMetadata({id_scope: options.id}).fetch()
    });
  },

  url: App.config.api_url + '/scopes',

  // parse: function(responseEntry) {
  //   var response = responseEntry;
  //   if(response.childs != undefined && response.childs.length > 0) {
  //     var scopeOsuna = undefined;
  //     _.each(response.childs, function(scope) {
  //       if(scope.id == 'osuna') {
  //         scopeOsuna = scope;
  //       }
  //     });
  //     scopeOsuna.categories.push('waste_d');
  //   } else if(response.id == 'osuna'){
  //     if(response.categories != undefined) {
  //       response.categories.push('waste_d');
  //     }
  //   }
  //   return response;
  // }

});
