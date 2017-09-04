'use strict';

App.View.HeaderView = Backbone.View.extend({
  _template: _.template( $('#header_template').html()),

  initialize: function(options) {
    this.render();
  },

  events: {
  	'click .tool .user' : '_togglePopup',
  	'click .user_popup .close_sesion' : '_closeSesion',
    'click .tool .admin' : '_togglePopup',
    'click .admin_popup .users' : '_goUsers',
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
    
    switch(App.config.layout){
      case 'fiware':
        logo = 'fiwaremaps_logo.svg';
        break;
      case 'fiware_zone_andalucia':
        logo = 'fiware_zone_logo.png';
        break;
      case 'cedus':
        logo = 'cedus_logo_cab.png';
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
