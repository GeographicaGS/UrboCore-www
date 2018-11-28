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

App.View.Admin.Support = Backbone.View.extend({
  _template: _.template( $('#admin-support_template').html() ),

  events: {
    'click .tabs li': function(e) {
      this._setActiveTab(e);
      this._toogleItems(e);
    },
  },

  initialize: function(options){
    _.bindAll(this, 'render');    
    this.render();
  },

  render: function(){
    this.$el.html(this._template({}));
    return this;
  },

  _setActiveTab: function(e) {
    _.each(this.$('.tabs a'), function(tab) {
      tab.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
  },

  _toogleItems: function(e) {
    var currentClass = e.currentTarget.getAttribute('data-type')
      ? '.' + e.currentTarget.getAttribute('data-type')
      : '';

    this.$('.items > div').addClass('hide');
    this.$('.items > div' + currentClass).removeClass('hide');
  }

});
