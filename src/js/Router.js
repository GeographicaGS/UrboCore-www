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

  routes: {
    // Admin sections
    'admin/users': 'adminUsers',
    'admin/scopes': 'adminScopesList',
    'admin/scope/:scope': 'adminScope',
    'admin/scope/:scope/:category': 'adminCategory',
    'admin/scope/:scope/:category/:entity/:variable': 'adminVariable',
    'admin/logs': 'adminLogs',
    'admin/logs/user/:id_user': 'adminLogsUser',
    'admin/support': 'adminSupport',
    'admin/support/:id_question': 'adminSupportDetail',
    // Main sections App
    '' : 'ini',
    'home' : 'home',
    'login' : 'login',
    'login_external?(user=:user)(&pass=:pass)' : 'loginExternal',
    ':scope/scope' : 'scopes',
    ':scope/dashboard' : 'dashboard',
    ':scope/categories/welcome': 'welcomeDashboard',
    ':scope/:category/dashboard(/)(:panel)' : 'categoryDashboard',
    ':scope/frames/:id': 'frame',
    ':scope/:category/frames/:id': 'frameVertical',
    ':scope/custom/:category/:entity/:id(/:section)': 'customdevice',
    ':scope/:entity/:id(/:section)': 'device',
    'credentials': 'credentials',
    // Others routes
    'embed/v1/:scope' : 'embedWidget',
    'notfound': 'notfound',
    'error': 'error',
    '*other': 'defaultRoute'
  },

  /**
   * COMMONS FUNCTIONS
   */

  /**
   * Callback that is triggered always the "Router" is initialized
   */
  initialize: function() {
    if (App.mode == 'standard') {
      if (App.config.log !== false) {
        this.bind('route', this.handlerChangeRoute);
      }
      this._auth = App.auth;
    }
  },

  /**
   * Event that is triggered when the route is change
   */
  handlerChangeRoute: function() {
    var path = App.lang + '/' + Backbone.history.getFragment();

    // To Google analytics actions
    ga('send', 'pageview', { page: "/" + path });

    if (this._auth.isLogged()) {
      // We record the change the route
      var statsUserModel = new App.Model.StatsUser();
      statsUserModel.set('url', path);
      statsUserModel.save();
    } else {
      console.log('No sending log');
    }
  },

  /**
   * Set the current scope where the user is located
   * @param {String} scope - scope name
   */
  setCurrentScope: function(scope) {
    App.currentScope = scope;
  },

  /**
   * ROUTES ASSOCIATED TO THE MAIN ACTIONS
   */

  /**
   * Function to route --> ''
   *
   * Default function
   */
  ini: function() {
    this.navigate('/home', { trigger: true } );
  },

  /**
   * Function to route --> 'home'
   *
   * Initial page (view) after login in the app
   */
  home: function() {
    var metadata = App.mv()._metadataCollection;

    // If only exists one scope
    if (metadata.length === 1) {
      var obj = metadata.at(0);
      var id = obj.get('id');

      if (obj.get('multi')) {
        // The scope is multiple, the we go to the "scopes view"
        return this.navigate(id + '/scope', { trigger: true });
      } else {
        // The scope is single, the we go to the "dashboard view"
        return this.navigate(id + '/dashboard', { trigger: true });
      }
    }
    // Draw the view in the 'main' DOM element
    App.showView(new App.View.MultiScopeList());
  },

  /**
   * Function to route --> 'login'
   *
   * Login formulary
   */
  login: function() {
    var LoginView = new App.View.Login({ 'headerView':App.header });
    // Draw the view in the 'main' DOM element
    App.showView(LoginView.render());
  },

  /**
   * Function to route --> 'login_external'
   *
   * This action allow us to do login with the URL parameters
   */
  loginExternal: function() {
    // get parameters from URL
    var queryParams = App.Utils.queryParamsToObject();

    if(queryParams !== {}) {
      var user = queryParams.user || '';
      var pass = queryParams.pass || ''; // pass in MD5

      // Login with the URL params
      this._auth.login(user, pass, function (err) {
        if (err) {
          this.navigate('login', { trigger: true });
        } else {
          App.mv().start(function () {
            this.navigate('', { trigger: true });
          }.bind(this));
        }
      }.bind(this));

    } else {
      this.navigate('login', { trigger: true });
    }
  },

  /**
   * Function to route --> 'scopes'
   *
   * When the current scope has others associated child scopes.
   * Show the list children scopes
   *
   * @param {String} scope - current scope to show
   */
  scopes: function(scope) {
    var scopeModel = new Backbone.Model({ scope: scope });
    var scopeListView = new App.View.ScopeList({ model: scopeModel });
    // Draw the view (the list children scopes) in the 'main' DOM element
    App.showView(scopeListView);
  },

  /**
   * Function to route --> 'correlations'
   *
   * The unique point founded about this route is the 'urbo-telefonica' repository
   * under the verticals 'parking' and 'dump'.
   *
   * @param {Boolean} multiScope - is multiple Scope?
   * @param {String} scope - current scope to show
   */
  correlations: function(multiScope, scope) {
    this.setCurrentScope(scope);

    var m = new Backbone.Model({
      scope: scope,
      multiScope: multiScope
    });
    var v = new App.View.Correlations({model:m});
    App.showView(v);
  },

  /**
   * Function to route --> 'frame'
   *
   * @param {String} scope - current scope to show
   * @param {String} frameId - identificacion frame
   */
  frame: function(scope, frameId) {
    this.setCurrentScope(scope);
    var metadataScope = App.mv().getScope(scope);
    var panelsFramesDataView = new App.View.Panels.Frames.Data({
      scopeModel: metadataScope,
      frameId: frameId
    });
    // Draw the view in the 'main' DOM element
    App.showView(panelsFramesDataView);
  },

  /**
   * Function to route --> 'frameVertical'
   *
   * @param {String} scope - current scope to show
   * @param {String} category - identificacion frame
   * @param {String} frameId - identificacion frame
   */
  frameVertical: function(scope, category, frameId) {
    this.setCurrentScope(scope);

    var categoryClassName = App.Utils.capitalizeFirstLetter(category);
    var metadataScope = App.mv().getScope(scope);

    // We look for into the object "App.View.Panels" the current category,
    // is possible that App.View.Panels[<category>] is defined
    // in other vertical, if the attributte doesn't exist
    // we show the "notFound" page
    if (!App.View.Panels.hasOwnProperty(categoryClassName)) {
      return this.navigate('notfound', { trigger: true });
    }

    var panelsFramesDataView = new App.View.Panels.Frames.Data({
      scopeModel: metadataScope,
      type: 'vertical',
      vertical: category,
      frameId: frameId
    });

    // Draw the view in the 'main' DOM element
    App.showView(panelsFramesDataView);
  },

  /**
   * Function to route --> 'dashboard'
   *
   * Show the different categories (verticals) from current Scope
   * @param {String} scope - current scope
   */
  dashboard: function(scope) {
    this.setCurrentScope(scope);
    var mdScope = App.mv().getScope(scope);
    var categories = mdScope.get('categories');

    if (categories.length > 1) {
      return this.navigate(scope + '/categories/welcome', { trigger: true });
    } else if(categories.length === 1) {
      return this.navigate(scope + '/' + categories.at(0).get('id') + '/dashboard', { trigger: true });
    }

    var backboneModel = new Backbone.Model({
      scope: scope,
      section: null
    });

    // Draw the view in the 'main' DOM element
    App.showView(new App.View.Dashboard({ model: backboneModel }));
  },

  /**
   * Function to route --> 'welcomeDashboard'
   *
   * Show the different categories (verticals) from current Scope
   * @param {String} scope - current scope
   */
  welcomeDashboard: function(scope) {
    this.setCurrentScope(scope);
    var mdScope = App.mv().getScope(scope);
    var categories = mdScope.get('categories');
    var backboneModel = new Backbone.Model({
      scope: scope,
      categories: categories
    });

    // Draw the view (list categories - verticals) in the 'main' DOM element
    App.showView(new App.View.CategoriesList({ model: backboneModel }));
  },

  /**
   * Function to route --> 'categoryDashboard'
   *
   * Show the selected panel (by default is 'master') from current category.
   * You can have different panels into an same category (vertical),
   * these panels must be created into the object 'App.View.Panels'
   * inside your vertical.
   *
   * Any vertical must have almost one panel called 'master'
   * "App.View.Panels.<vertical_name>.Master"
   *
   * @param {String} scope - current scope
   * @param {String} category - current category (vertical)
   * @param {String} panel - current panel (default master)
   */
  categoryDashboard: function(scope, category, panel) {
    this.setCurrentScope(scope);
    var defaultPanel = 'master';
    var metadataScope = App.mv().getScope(scope);
    var categoryClassName = App.Utils.capitalizeFirstLetter(category);

    if (!panel) {
      panel = defaultPanel;
    }

    var panel = App.Utils.capitalizeFirstLetter(panel);

    // If panel inside "App.View.Panels" doesn't exist
    if (!App.View.Panels.hasOwnProperty(categoryClassName)
      || !App.View.Panels[categoryClassName].hasOwnProperty(panel)) {
      return this.navigate('notfound', { trigger: true });
    }

    // Set 'backurl' when user click on "back button navigation"
    if (panel.toLowerCase() === defaultPanel
      && metadataScope.get('categories').length === 1) {
      var parentId = metadataScope.get('parent_id');
      if (parentId === 'orphan' || !parentId) {
        App.getNavBar().set('backurl', '/');
      } else {
        App.getNavBar().set('backurl', '/' + parentId + '/scope');
      }
    } else {
      App.getNavBar().set('backurl', null);
    }

    // Draw the current panel view in the 'main' DOM element
    App.showView(
      new App.View.Panels[categoryClassName][panel]({
        scopeModel : metadataScope,
        id_category : category
      })
    );
  },

  map: function(scope,variables) {
    this.setCurrentScope(scope);
    App.showView(
      new App.View.Map({
        scope:scope,
        variables: variables
      })
    );
  },

  /**
   * To show detailt about a device
   *
   * @param {String} scope - current scope
   * @param {String} entity - current entity
   * @param {String} id - idenfitication device (sensor)
   * @param {String} section - section inside the view (tab)
   */
  device: function(scope, entity, id, section) {
    this.setCurrentScope(scope);

    if (['lastdata','raw','period','other'].indexOf(section) === -1) {
      section = 'lastdata';
    }

    var model = new App.Model.Device({
      scope: scope,
      entity: entity,
      id: id,
      tab: section
    });

    var view = new App.View.Device({
      model: model
    });

    App.showView(view.render());
  },

  /**
   * To show detailt about a device (custom view)
   *
   * @param {String} scope - current scope
   * @param {String} category - current category (vertical)
   * @param {String} entity - current entity
   * @param {String} id - idenfitication device (sensor)
   * @param {String} section - section inside the view (tab)
   */
  customdevice: function(scope, category, entity, id, section) {
    this.setCurrentScope(scope);

    var categoryCapitalize = App.Utils.capitalizeFirstLetter(category)

    var model = new App.Model.Device({
      scope: scope,
      entity: entity,
      id: id,
      tab: section
    });

    var view = new App.View.Device[categoryCapitalize].Custom({
      model: model
    });

    App.showView(view.render());
  },

  credentials: function() {
    App.showView(new App.View.CredentialList());
  },

  /**
   * ROUTES ASSOCIATED TO THE ADMIN ACTIONS
   */

  /**
   * Function to route --> 'adminUsers'
   *
   * Show the list users
   */
  adminUsers: function() {
    App.showView(new App.View.UserList());
  },

  /**
   * Function to route --> 'adminScopesList'
   *
   * Show the list scopes
   */
  adminScopesList: function() {
    App.showView(new App.View.Admin.ScopeList());
  },

  /**
   * Function to route --> 'adminScope'
   *
   * Show the detail view from current scope
   *
   * @param {String} scope - current scope
   */
  adminScope: function(scope) {
    this.setCurrentScope(scope);
    App.showView(new App.View.Admin.Scope({ scope: scope }));
  },

  /**
   * Function to route --> 'adminCategory'
   *
   * Show the detail view from current category
   * associated to one scope
   *
   * @param {String} scope - current scope
   * @param {String} category - current category
   */
  adminCategory: function(scope, category) {
    this.setCurrentScope(scope);
    App.showView(
      new App.View.Admin.Category({
        scope: scope,
        category: category
      })
    );
  },

  /**
   * Function to route --> 'adminVariable'
   *
   * Show the detail view from current variable
   * associated to one scope, entity and category
   *
   * @param {String} scope - current scope
   * @param {String} category - current category
   * @param {String} entity - current scope
   * @param {String} variable - current scope
   */
  adminVariable: function(scope, category, entity, variable) {
    this.setCurrentScope(scope);
    App.showView(
      new App.View.Admin.Variable({
        scope: scope,
        category: category,
        entity: entity,
        variable: variable
      })
    );
  },

  /**
   * Function to route --> 'adminLogs'
   *
   * Show the logs page with all access from different users
   */
  adminLogs: function() {
    App.showView(new App.View.Admin.Logs().render());
  },

  /**
   * Function to route --> 'adminLogsUser'
   *
   * Show the logs page with all access from current user
   * @param {String} id_user - current user
   */
  adminLogsUser: function(id_user) {
    App.showView(new App.View.Admin.Logs({ id_user: id_user }).render());
  },

  /**
   * Function to route --> 'adminSupport'
   *
   * Show the support page with information (FAQ)
   * about the app for all administrator users
   */
  adminSupport: function() {
    App.showView(new App.View.Admin.Support().render());
  },

  /**
   * Function to route --> 'adminSupport'
   *
   * Show the detail support page about the current question
   * @param {String} id_question - current question
   */
  adminSupportDetail: function(id_question) {
    App.showView(new App.View.Admin.SupportDetail({ id_question: id_question }).render());
  },

  /**
   * ROUTES ASSOCIATED TO ERROR PAGES AND OTHERS
   */

  /**
   * Function to route --> 'embedWidget'
   *
   * When we publish a widget to use in other
   * domain (this widget is loaded through an iframe),
   * the widget calls to this URL.
   *
   * The APP's function '_embedIni' is launched
   *
   * @param {String} scope - current scope
   */
  embedWidget: function(scope) {
    var opts = App.Utils.queryParamsToObject();

    opts.id_scope = scope;
    this.setCurrentScope(scope);
    // Load metadata
    App.mv().start(function (collection) {
      App.mv().getScope(scope, function(scope) {
        App.showView(new App.View.Widgets.Embed(opts).render());
      });
    });
  },

  /**
   * Function to route --> 'notfound'
   *
   * Show the 'not found' page
   */
  notfound: function() {
    App.showView(new App.View.NotFound());
  },

  /**
   * Function to route --> 'error'
   *
   * Show the error page
   */
  error: function() {
    App.showView(new App.View.Error());
  },

  /**
   * Function to route --> 'defaultRoute'
   *
   * If the user put a wrong URL in the browser
   * this action will be launched
   */
  defaultRoute: function() {
    App.showView(new App.View.NotFound());
  }

});
