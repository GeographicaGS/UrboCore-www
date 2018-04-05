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

App.View.Widgets.Container = Backbone.View.extend({
  initialize: function(options) {
    for (var i in options)
      this[i] = options[i];

    // Drop empty elements for widgets
    _.each(this.widgets, function(widget){
      if(!widget.hasPermissions())
        widget.close();
    });

    this.widgets = _.filter(this.widgets, function(widget){
      return widget.hasPermissions();
    });


    this.render();
  },

  onClose: function(){
    _.each(this.widgets,function(widget){
      widget.close();
    });
    this.stopListening();
  },

  render: function(){
    var _this = this;

    _.each(this.widgets,function(widget){
      _this.$el.append(widget.render().$el);
    });

    if(!this.disableMasonry){
      setTimeout(function(){
        _this.$el.masonry({
          gutter: 20,
          columnWidth: 360
        });
        _this.$('.widget').addClass('active');
      }, 1);
    }
  }
});
