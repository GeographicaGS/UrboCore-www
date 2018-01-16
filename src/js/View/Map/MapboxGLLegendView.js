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
App.View.Map.MapboxLegendView = Backbone.View.extend({

  items: [],

  events: {
    "click #toggler": 'toggle'
  },

  initialize: function(map, items) {
    this._template = _.template($("#map-mapbox_legend_template").html()); 
    this._mapInstance = map;
  },

  render: function() {
    this.$el.append(this._legend);
    return this;
  },

  addItemLegend: function(item) {
    let exist = _.find(this.items, function(i) {
      return i.id == item.sectionId;
    });
    if (exist) {
      exist.childs.push({name: item.name});
    } else {
      this.items.push({
        id: item.sectionId,
        icon: item.sectionIcon,
        name: item.sectionName,
        childs: [{name: item.name}]
      });
    }
  },

  toggle: function(event) {
    var body = this.$el[0].querySelectorAll("#mapbox-legend .body")[0]
    if (body.classList.contains('opened')) {
      event.target.classList.remove('opened');
      body.classList.remove('opened');
    } else {
      event.target.classList.add('opened');      
      body.classList.add('opened');      
    }
  },

  drawLegend: function() {
    let items = '';
    this.items.reverse();
    console.log(items);
    this.$el.append(this._template({
      'legendTitle': __('Ajustes'), 
      'items': this.items,
    }));
  }

});