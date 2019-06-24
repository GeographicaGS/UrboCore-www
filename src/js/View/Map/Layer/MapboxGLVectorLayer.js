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

App.View.Map.Layer.MapboxGLVectorLayer = App.View.Map.Layer.MapboxGLLayer.extend({

  _map: null,
  _ids: [],
  _idSource: '',
  _model: null,
  legendConfig: null,
  dataSource: null,
  layers: [],

  initialize: function (model, body, legend, map) {
    this._map = map;
    this._model = model;
    this.legendConfig = legend;
    this._mapEvents = {};
    // TODO: refactor to don't need to load this tile
    this._map.addSource(this._idSource, {
      'type': 'vector',
      'tiles': ["https://tiles.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt"],
    });
    this._map._layers = this._map._layers.concat(this._layersConfig());
    this._map.addLayers(this._layersConfig());
    this.listenTo(this._model, 'change', this._success);
    this.updateData(body);
    this.addToLegend();
  },

  addToLegend: function () {
    if (this.legendConfig) {
      this._map.addToLegend(this.legendConfig);
    }
  },

  on: function (event, ids, callback) {
    if (this._mapEvents[event] === undefined) {
      this._mapEvents[event] = {};
    }
    if (ids.constructor === Array) {
      ids.forEach(id => {
        this._map._map.on(event, id, callback);
        this._mapEvents[event][id] = callback;
      });
    } else {
      this._map._map.on(event, ids, callback);
      this._mapEvents[event][ids] = callback;
    }
    return this;
  },

  offAll: function () {
    _.each(this._mapEvents, function (childs, event) {
      _.each(childs, function (callback, name) {
        this._map._map.off(event, name, callback);
      }.bind(this))
    }.bind(this))
  },

  onClose: function () {
    this.offAll();
  },

  _success: function (change) {
    this.dataSource = (change.changed.type) 
      ? change.changed 
      : { 
          type: 'FeatureCollection', 
          features: [] 
        },

    // Change the data in layer
    this._map.getSource(this._idSource)
      .setData(this.dataSource);
    this._map._sources
      .find(function (src) {
        return src.id === this._idSource;
      }.bind(this))
      .data = { 
        type: 'geojson',
        data: this.dataSource 
      };

    // The event is launched
    this.trigger('update', { id: this._idSource } );

    return change;
  },

  _error: function () {
    console.error("Error");
  }
});
