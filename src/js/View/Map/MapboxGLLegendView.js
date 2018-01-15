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

  //TODO: REHACER ESTO COMO SE ESTÁ HACIENDO CON EL POPUP
  _legend: 
    '<div class="mapbox-legend" id="mapbox-legend">' +
    '  <div class="title">' + __('Ajustes') + '</div>' +
    '  <div class="body">' +
    '    ##ITEMS##' +
    '  </div>' +
    '</div>'
  ,
  _item: `
    <div class="mapbox-legend-item">
      <div class="item-head">
        ##ITEM_LOGO##
        <span>##ITEM_NAME##</span>
      </div>
      ##CHILDS##
    </div>
  `,
  _child: `
    <div class="mapbox-legend-item-child" id="##ITEM_ID##">
      <span>##ITEM_CHILD##</span>
    </div>
  `,

  items: [],

  initialize: function(map, items) {
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

  drawLegend: function() {
    let items = '';
    let legend = '';
    this.items.reverse();
    this.items.forEach(function(item){
      let childs = '';
      if(item.childs.length > 2) {
        item.childs.forEach(function(child) {
          childs += this._child.replace(/##ITEM_CHILD##/, child.name);
        }.bind(this))
      }

      items += this._item
        .replace(/##ITEM_LOGO##/, '<img src="' + item.icon + '"/>')
        .replace(/##ITEM_NAME##/, item.name)
        .replace(/##CHILDS##/,childs);
    }.bind(this));


    legend = this._legend.replace(/##ITEMS##/, items);
    this.$el.append(legend);
  }

});