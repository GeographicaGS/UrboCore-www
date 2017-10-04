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

App.View.Widgets.VersusVariables = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_versus_template').html() ),

  initialize: function(options) {
    this._collection = options.collection;
    this._precedence = options.precedence;

  },

  render:function(){
    var _this = this;
    this._collection.fetch({
      data: {},
      success:function(data){

        var primary = data.toJSON().filter(function(d){ return d.name==_this._precedence[0] })[0] || {};
        var secondary = data.toJSON().filter(function(d){ return d.name==_this._precedence[1] })[0] || {};

        _this.$el.html(_this._template({
          primary: {
            class: 'outOfService',
            label: __('Est. fuera de servicio'),
            value: primary.value || '--'
          },
          secondary: {
            class: 'withIncidence',
            label: __('Con alguna incidencia'),
            value: secondary.value || '--'
          }

        }));
      }
    });

    return this;
  }

});
