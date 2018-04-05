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

App.View.Map.Layer.MapboxSQLLayer = App.View.Map.Layer.MapboxGLVectorLayer.extend({


  initialize: function(config) {
    this.legendConfig = config.legend;
    this.layers = config.layers;
    this._ignoreOnLegend = config.ignoreOnLegend;
    this._idSource = config.source.id;
    this._ids = config.layers.map(l => l.id);

    App.View.Map.Layer.MapboxGLVectorLayer.prototype
      .initialize.call(this, config.source.model,
      config.source.payload,config.legend, config.map);
  },

  _layersConfig: function() {
    return this.layers;
  },

  _success: function(model) {
    var response = (model.changed)? model.changed.response : undefined;
    if (response) {
      var cartoLayer = response;
      var nStyle = this._map._map.getStyle();
      nStyle.sources[this._idSource].tiles = cartoLayer.metadata.tilejson.vector.tiles;
      this._map._map.setStyle(nStyle);
    }
  },

  _updateSQLData: function(sql) {
    this._model.clear();
    this._model.params = {
      layers:[ {
        id: 'cartoLayer',
        options:{
          sql: sql
        }
      }]
    };
    
    this._model.fetch({
    });
  },
});
