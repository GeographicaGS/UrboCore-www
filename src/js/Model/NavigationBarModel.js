'use strict';

App.Model.NavigationBar = Backbone.Model.extend({
  defaults: {
    breadcrumb : [],
    visible: false,
    backurl: null,
    loading: false,
    cities:[],
    scopeInfo:{},
    menu: {
      showable:true
    }
  }
});
