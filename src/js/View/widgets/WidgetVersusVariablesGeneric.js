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

App.View.Widgets.VersusVariablesGeneric = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_versus_template').html() ),

  initialize: function(options) {
    this._collection = options.collection;
    this._precedence = options.precedence;
  },

  render:function(){
    var _this = this;
    this._collection.fetch({
      data: this._collection.options.data,      
      success:function(data){
        var primary = data.toJSON()[0];
        var secondary = data.toJSON()[1];

        _this.$el.html(_this._template({
          primary: {
            class: primary.cssClass,
            label: primary.title,
            value: (primary.value)?primary.value:'--'
          },
          secondary: {
            class: secondary.cssClass,
            label: secondary.title,
            value: (secondary.value)?secondary.value:'--'
          }

        }));
      }
    });

    return this;
  }

});
