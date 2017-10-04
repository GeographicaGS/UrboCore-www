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

App.View.Admin.Logs = App.View.Container.extend({
  _template: _.template( $('#admin-logs_template').html() ),

  events: {

  },

  initialize: function(options){
    options = options || {};
    App.View.Container.prototype.initialize.call(this,options);

    this._id_user = options.id_user;

    var tableModel = new Backbone.Model({
      'method': 'GET',
      'css_class':'',
      'csv':false,
      'columns_format':{
        'url':{'title':__('Página'), 'css_class':'bold darkBlue counter','formatFN':function(d){return '<a href="/'+d.substring(3)+ '" jslink>'+ d + '</a>'}},
        'pageviews':{'title':__('Número de visitas')}
      }
    });

    var dataCollection = new App.Collection.Base({},{data:{}});
    dataCollection.url = App.config.api_url + '/logs/pageviews';

    if (this._id_user){
      dataCollection.url += '/user/'+ options.id_user;
      this.userModel = new Backbone.Model();
      this.userModel.url = App.config.api_url + '/users/' + this._id_user;

      this.lastLoginModel = new Backbone.Model();
      this.lastLoginModel.url = App.config.api_url + '/logs/user/' + this._id_user + '/lastlogin';

    }

    this.subviews.push(new App.View.Widgets.Table({
      model: tableModel,
      data: dataCollection,
      listenContext: true
    }));

    this.subviews.push(new App.View.Date({'compact':false}));
    this.listenTo(App.ctx,"change:start change:finish",this.refresh);

  },

  render: function(){
    var _this = this;
    this.$el.html(this._template({user: this._id_user!=null}));
    this.$('.time').html(this.subviews[1].render().$el);
    this.$('.content').html(this.subviews[0].render().$el);

    if (this._id_user){
      this.userModel.fetch({success: function(m){
        _this.$('.userinfo').html(m.get('name')+ ' ' + m.get('surname'));
      }});
      this.lastLoginModel.fetch({success: function(m){
        var ll = m.get('lastlogin');
        _this.$('.lastlogin').html(ll ? App.formatDateTime(ll) : __('Nunca se ha logeado'));
      }});
    }
    return this;
  },

  refresh: function(){
    this.subviews[0].render();
  }

});
