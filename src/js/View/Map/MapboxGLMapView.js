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
App.View.Map.MapboxView = Backbone.View.extend({

  basemaps: {},
  _currentBasemap: 'dark',
  _availableBasemaps: ['dark','positron'],
  _center: [0,0],
  _zoom: 12,
  _map: null,

  initialize: function(options) {
    this._currentBasemap = options.defaultBasemap || 'dark';
    this._availableBasemaps = options.availableBasemaps || ['dark','positron'];
    this._center = options.center || [0, 0];
    this._zoom = options.zoom || 12;
    this.$el[0].id = "map";
    this._preloadBasemaps();
  },

  render: function() {
    setTimeout(()=>{
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zbW9yc290IiwiYSI6ImNqYXBvcW9oNjVlaDAyeHIxejdtbmdvbXIifQ.a3H7tK8uHIaXbU7K34Q1RA';
      this._map = new mapboxgl.Map({
        container: this.$el[0],
        style: `/mapstyles/${this._currentBasemap}.json`,
        center: this._center,
        zoom: this._zoom,
      });
    },100)
  },

  onClose: function() {

  },

  addLayer: function() {

  },

  changeBasemap: function(name) {
    this._map.setStyle(this.basemaps[name]);
    this._currentBasemap = name;
  },

  _preloadBasemaps: function() {
    Promise.all(this._availableBasemaps.map(name => {
      return this._loadBasemap(name);
    })).then((response) => {
      Promise.all(response.map(r => r.json())).then(response => {
        this._availableBasemaps.forEach((bm, i) => {
          this.basemaps[bm] = response[i];
        });
      })
    });
  },

  _loadBasemap: function(name) {
    return fetch(`/mapstyles/${name}.json`);
  }



});

