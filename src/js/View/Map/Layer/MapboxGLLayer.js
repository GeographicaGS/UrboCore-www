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

App.View.Map.Layer.MapboxGLLayer = Backbone.View.extend({

  _map: null,
  _ids: [],
  _idSource: '',
  _model: null,
  legendConfig: null,
  dataSource: null,
  layers: [],

  initialize: function(model, body, legend, map) {
    this._map = map;
    this._model = model;
    this.legendConfig = legend;
    this._map.addSource(this._idSource, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": []
      },
    });
    this._map._layers = this._map._layers.concat(this._layersConfig());
    this._map.addLayers(this._layersConfig());
    this.listenTo(this._model, 'change', this._success);
    this.updateData(body);
    this.updateLegend();
  },

  updateLegend: function() {
    if (this.legendConfig) {
      this._map.updateLegend(this.legendConfig);
    }
  },

  updateData: function(body) {
    this._model.fetch({data: body});
  },

  on: function(event, id, callback) {
    this._map._map.on(event,id,callback);
    return this;
  },

  _success: function(change) {
    this.dataSource = change.changed;
    this._map.getSource(this._idSource).setData(this.dataSource);
    this._map._sources.find(function(src) {
      return src.id === this._idSource;
    }.bind(this)).data = {'type': 'geojson', 'data':this.dataSource};
    return change;
  },

  _error: function() {
    console.error("Error");
  }

  
});
