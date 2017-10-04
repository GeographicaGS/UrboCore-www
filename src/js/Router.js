// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

'use strict';

var app = app || {};

App.Router = Backbone.Router.extend({

  /* define the route and function maps for this router */
  routes: {
      '' : 'ini',
      'home' : 'home',
      'login' : 'login',
      'embed/v1/:scope' : 'embedWidget',
      ':scope/scope' : 'scopes',

      ':scope/dashboard' : 'dashboard',
      ':scope/categories/welcome': 'welcomeDashboard',
      ':scope/:category/dashboard(/)(:panel)' : 'categoryDashboard',

      // Admin scopes
      'admin/scopes': 'adminScopesList',
      'admin/scope/:scope': 'adminScope',
      'admin/scope/:scope/:category': 'adminCategory',
      'admin/scope/:scope/:category/:entity/:variable': 'adminVariable',
      'admin/logs': 'adminLogs',
      'admin/logs/user/:id_user': 'adminLogsUser',

      // Frames
      ':scope/frames/:id': 'frame',

      // Generic routes
      ':scope/:entity/:id(/:section)' : 'device',

      // Users
      'users' : 'users',

      'notfound' : 'notfound',
      'error' : 'error',
      '*other'    : 'defaultRoute'
      /* This is a default route that also uses a *splat. Consider the
      default route a wildcard for URLs that are either not matched or where
      the user has incorrectly typed in a route path manually */

  },


  initialize: function() {
    if (App.mode == 'standard'){
      this.bind('route', this._pageView);
      this._auth = App.auth;
    }
  },

  _pageView: function() {
    var path = App.lang + '/' + Backbone.history.getFragment();
    ga('send', 'pageview', {page: "/" + path});

    if (this._auth.isLogged()){
      var m = new App.Model.StatsUser();
      m.set('url',path);
      m.save();
    }
    else{
      console.log('No sending log');
    }
  },

  setCurrentScope: function(scope){
    App.currentScope = scope;
  },

  ini: function(){
    this.navigate('/home',{trigger: true});
  },

  home: function(){
    var metadata = App.mv()._metadataCollection;
    if (metadata.length==1) {
      var obj = metadata.at(0);
      var id = obj.get('id');
      if (obj.get('multi'))
        return this.navigate(id + '/scope',{trigger: true});
      else
        return this.navigate(id + '/dashboard',{trigger: true});

    }

    App.showView(new App.View.MultiScopeList());
  },

  login: function(){
    var v = new App.View.Login({'headerView':App.header});
    App.showView(v.render());
  },

  scopes: function(scope) {
    var m = new Backbone.Model({scope: scope});
    var v = new App.View.ScopeList({model:m});
    App.showView(v);
  },

  correlations: function(multi_scope, scope) {
    this.setCurrentScope(scope);

    var m = new Backbone.Model({scope: scope, multiScope: multi_scope});
    var v = new App.View.Correlations({model:m});
    App.showView(v);
  },

  frame: function(scope, frameId) {
    this.setCurrentScope(scope);
    var metadataScope = App.mv().getScope(scope);
    var v = new App.View.Panels.Frames.Data({
      scopeModel: metadataScope,
      frameId: frameId
    });
    App.showView(v);
  },

  dashboard: function(scope){
    this.setCurrentScope(scope);
    var mdScope = App.mv().getScope(scope);
    var categories = mdScope.get('categories');
    if (categories.length > 1) {
      return this.navigate(scope + '/categories/welcome',{trigger: true});
    }
    else if(categories.length === 1) {
      return this.navigate(scope + '/' + categories.at(0).get('id') + '/dashboard',{trigger: true});
    }

    var m = new Backbone.Model({scope: scope,section: null});
    App.showView(new App.View.Dashboard({model: m}));
  },

  welcomeDashboard: function(scope) {
    this.setCurrentScope(scope);
    var mdScope = App.mv().getScope(scope);
    var categories = mdScope.get('categories');

    var m = new Backbone.Model({
      scope: scope,
      categories: categories
    });
    App.showView(new App.View.CategoriesList({model: m}));
  },

  categoryDashboard: function(scope,category,panel){
    this.setCurrentScope(scope);
    var metadataScope = App.mv().getScope(scope);

    if (!panel) panel = 'master';
    var categoryClassName = App.Utils.capitalizeFirstLetter(category);
    var panel = App.Utils.capitalizeFirstLetter(panel);

    if (!App.View.Panels.hasOwnProperty(categoryClassName)
      || !App.View.Panels[categoryClassName].hasOwnProperty(panel))
      return this.navigate('notfound', {trigger: true});

    // Set back button navigation
    if (panel.toLowerCase() === 'master' && metadataScope.get('categories').length==1){
      var parentId = metadataScope.get('parent_id');
      if (parentId === 'orphan' || !parentId) {
        App.getNavBar().set('backurl', '/');
      } else {
        App.getNavBar().set('backurl', '/' + parentId + '/scope');
      }
    } else {
      App.getNavBar().set('backurl',null);
    }
    App.showView(new App.View.Panels[categoryClassName][panel]({
      scopeModel : metadataScope,
      id_category : category
    }));
  },

  map: function(scope,variables){
    this.setCurrentScope(scope);

    App.showView(new App.View.Map({'scope':scope ,'variables': variables}));
  },

  device: function(scope,entity,id,section){
    this.setCurrentScope(scope);

    if (['lastdata','raw','period','other'].indexOf(section)==-1)
      section = 'lastdata';
    var model = new App.Model.Device({'scope':scope, 'entity':entity,'id': id,'tab': section});
    var view = new App.View.Device({'model': model});
    App.showView(view.render());
  },

  users: function(){
    // if(App.auth.getUser().superadmin) {
      App.showView(new App.View.UserList());
    // }
  },

  adminScopesList: function(){
    App.showView(new App.View.Admin.ScopeList());
  },

  adminScope: function(scope){
    this.setCurrentScope(scope);

    App.showView(new App.View.Admin.Scope({ scope: scope }));
  },

  adminCategory: function(scope,category){
    this.setCurrentScope(scope);

    App.showView(new App.View.Admin.Category({ scope: scope, category: category }));
  },

  adminVariable: function(scope,category,entity,variable){
    this.setCurrentScope(scope);

    App.showView(new App.View.Admin.Variable({ scope: scope, category: category, entity: entity, variable: variable }));
  },

  adminLogs: function(){
    var v = new App.View.Admin.Logs().render();
    App.showView(v);
  },

  adminLogsUser: function(id_user){
    var v = new App.View.Admin.Logs({id_user:id_user}).render();
    App.showView(v);
  },

  defaultRoute: function(){
    App.showView(new App.View.NotFound());
  },

  notfound: function(){
    App.showView(new App.View.NotFound());
  },

  error: function(){
    App.showView(new App.View.Error());
  },

  embedWidget: function(scope){
    var opts = App.Utils.queryParamsToObject();
    opts.id_scope = scope;
    this.setCurrentScope(scope);
    App.mv().getScope(scope, function(){
      var v = new App.View.Widgets.Embed(opts);
      App.showView(v.render());
    });

  }
});
