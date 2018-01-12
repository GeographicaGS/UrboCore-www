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
  _legend: `
    <div class="mapbox-legend">
      ##ITEMS##
    </div>
  `,
  _item: `
    <div class="mapbox-legend-item">
      <span>##ITEM_NAME##</span>
      ##CHILDS##
    </div>
  `,
  _child: `
    <div class="mapbox-legend-item-child">
      <span>##ITEM_CHILD##</span>
    </div>
  `,

  initialize: function(map, items) {
    this._mapInstance = map;
    this.items = [{
      name: 'Tipo de consumo',
      childs: [{
        name: 'Doméstico',
      }, {
        name: 'Industrial',
      }]
    }, {
      name:'Sensores',
      childs: []
    }];
  },

  render: function() {
    let items = '';
    let legend = '';

    this.items.forEach(function(item){
      let childs = '';
      item.childs.forEach(function(child) {
        childs += this._child.replace(/##ITEM_CHILD##/, child.name);
      }.bind(this))
      items += this._item.replace(/##ITEM_NAME##/, item.name)
        .replace(/##CHILDS##/,childs);
    }.bind(this));


    legend = this._legend.replace(/##ITEMS##/, items);
    this.$el.append(legend);
    return this;
  }

});