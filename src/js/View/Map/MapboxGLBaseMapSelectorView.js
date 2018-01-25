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
  _mapInstance: {},
  _basemaps: [],
  
  events: {
    'change #basemapselector': 'changeBasemap'
  },

  initialize: function(basemaps, map) {
    this._template = _.template($('#map-basemap_selector_template').html()),
    this._mapInstance = map;
    this._basemaps = basemaps;
  },

  render: function() {
    let options = '';
    let selector = '';

    this.$el.append(this._template({items: this._basemaps}));
    return this;
  },

  changeBasemap: function(e){
    let next = e.target.value;
    this._mapInstance.changeBasemap(next);
  }

});