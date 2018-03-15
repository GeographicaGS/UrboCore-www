// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

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
