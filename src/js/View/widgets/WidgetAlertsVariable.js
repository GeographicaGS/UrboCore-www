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


App.View.Widgets.AlertsVariable = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_alerts_variable_template').html()),

  events: {
    'click .alertWidget': 'onclick',
  },

  initialize: function(options) {
    this.options = options;
    // this.onclick = options.onclick;
    this.variables = options.variables;
  },

  onclick: function(e) {
    if(typeof this.options.onclick === 'function') {
      this.options.onclick(e);
    }
  },

  render:function() {
    var _this = this;
    this.collection.fetch({
      data: this.options.searchParams,
      success: function(response) {
        var items = response.toJSON();

        _this.$el.parent().parent().find('div.widget_header .title').html('<strong>' + items.length + '</strong> ALERTAS DE CONSUMO');
        _this.$el.html(_this._template({items: items, variables: _this.variables}));    
      }
    });
    return this;
  }


});
