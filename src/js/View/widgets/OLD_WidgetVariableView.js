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

App.View.WidgetVariable = App.View.Widgets.Base.extend({
  _template: _.template( $('#widgets-widget_variable_template').html() ),

  initialize: function(options) {
    this.render();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.setElement(this._template({
      'url': this.url,
      'title':this.title,
      'category_name': this.category_name
    }));
    var model = new Backbone.Model({
      botonLocationView:this.$(".botons"),
      tooltipIcon: __('Ahora')
    });
    this._renderRealTimeComponent(model);
    return this;
  }

});
