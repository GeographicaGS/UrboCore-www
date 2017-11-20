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

App.View.Login = Backbone.View.extend({
  _template: _.template( $('#login_template').html() ),
  className: 'login',
  initialize: function(options) {
    this._headerView = options.headerView;
  },

  events: {
    'click input[type="submit"]': 'login'
  },

  onClose: function () {
    this.stopListening();
  },

  login: function (e) {
    e.preventDefault();
    var _this = this;

    // Loading
    this.$el.append(App.widgetLoading());

    var email = this.$email.val().trim();
    var password = this.$password.val().trim();

    if (!email || !password)
      this.$el.addClass('error');

    App.auth.login(email, md5(password), function (err) {
      if (err) {
        _this.$el.addClass('error');
        _this.$('.loading').remove();
      } else {
        App.mv().start(function () {
          App.router.navigate('', {trigger: true});
          _this._headerView.render();
        })
      }
    });
  },

  render: function () {
    var logo;

    switch (App.config.layout) {
      case 'fiware':
        logo = 'fiwaremaps_logo-negativo.svg';
        break;
      case 'fiware_zone_andalucia':
        logo = '../verticals/theme-fiware/img/fiware_zone_andalucia_login.png';
        break;
      case 'cedus':
        logo = '../verticals/theme-cedus/img/cedus_logo_login@2x.png';
        break;
      default:
        logo = 'telefonica-logo_negativo.svg';
    }

    this.$el.html(this._template({logo: logo}));
    this.$email = this.$('input[name="email"]');
    this.$password = this.$('input[name="password"]');

    return this;
  }

});
