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
App.View.Map.MapboxBaseMapSelectorView = Backbone.View.extend({
  _basemapSelectorTemplate: `
    <select class="basemapselector" id="basemapselector">
      ##options##
    </select>`,
  _optionTemplate: `
    <option value="##basemap##">##basemap##</option>
  `,
  _mapInstance: {},
  _basemaps: [],

  initialize: function(map, basemaps) {
    this._mapInstance = map;
    this._basemaps = basemaps;
  },

  render: function() {
    let options = '';
    let selector = '';

    this._basemaps.forEach(bm => {
      options += this._optionTemplate.replace(/##basemap##/g,bm);
    });

    selector = this._basemapSelectorTemplate.replace(/##options##/g, options);
    this.$el.append(selector);
    this.$el.on('change', '#basemapselector', (e) => {
      let next = document.getElementById("basemapselector").value;
      this._mapInstance.changeBasemap(next);
    });
    return this;
  }

});