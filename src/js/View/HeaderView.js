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

App.View.HeaderView = Backbone.View.extend({

  _template: App.config.layout_header ?  _.template( $('#'+ App.config.layout_header).html() ) : _.template( $('#header_template').html() ),

  initialize: function(options) {
    this.render();
  },

  events: {
  	'click .tool .user' : '_togglePopup',
  	'click .user_popup .close_sesion' : '_closeSesion',
    'click .tool .admin' : '_togglePopup',
    'click .admin_popup .users' : '_goUsers',
    'click .admin_popup .credentials' : '_goCredentials',
    'click .admin_popup .scopes' : '_goScopes',
    'click .admin_popup .logs' : '_goLogs',
    'click .tool .lang' : '_togglePopup',
  	'click a:not(.admin) a:not(.user), .user_popup li:not(.close_sesion)' : '_pending',
    'mouseleave': '_closePopups',
    'click .council' : '_goToHome'
  },

  _goToHome: function(e) {
    e.preventDefault();
    App.router.navigate('', {trigger:true});
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    var logo;

    switch(App.config.layout) {
      case 'fiware':
        logo = 'fiwaremaps_logo.svg';
        break;
      case 'fiware_zone_andalucia':
        logo = 'fiware_zone_logo.png';
        break;
      case 'cedus':
        logo = '../verticals/theme-cedus/img/cedus_logo_cab.png';
        break;
      default:
        logo = 'telefonica-logo_negativo.svg';
    }

    this.$el.html(this._template({
      logo: logo
    }));
    return this;
  },

  _pending:function(e){
  	e.preventDefault();
  	alert('Funcionalidad en desarrollo');
  },

  _closeSesion:function(){
  	App.auth.logout();
  	App.router.navigate('login',{trigger: true});
  	this.$('.user_popup').removeClass('active');
  },

  _goUsers:function(){
    App.router.navigate('users',{trigger: true});
    this.$('.admin_popup').removeClass('active');
  },

  _goCredentials:function(){
    App.router.navigate('credentials',{trigger: true});
    this.$('.admin_popup').removeClass('active');
  },

  _goScopes:function(){
    App.router.navigate('/admin/scopes',{trigger: true});
    this.$('.admin_popup').removeClass('active');
  },

  _goLogs:function(){
    App.router.navigate('/admin/logs',{trigger: true});
    this.$('.admin_popup').removeClass('active');
  },

  _closePopups:function(){
    this.$('.genericPopup').removeClass('active');
  },

  _togglePopup:function(e){
    e.preventDefault();
    var classPopup = '.' + $(e.currentTarget).attr('popup') + '_popup';
    this.$('.genericPopup').not(classPopup).removeClass('active');
    this.$(classPopup).toggleClass('active');
  }

});
