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

/**
 * Used by the layers that make use of the API
 */
App.View.Map.Layer.MapboxGeoJSONAPILayer = App.View.Map.Layer.MapboxGLLayer.extend({

  initialize: function (config) {
    // Default source options
    var _defaultSourceOptions = _.extend({}, {
      cluster: true,
      clusterMaxZoom: 17, // Max zoom to cluster points on
      clusterRadius: 13 // Radius of each cluster when clustering points (defaults to 50)
    }, config.options || {});

    this.legendConfig = config.legend;
    this.layers = config.layers;
    this._ignoreOnLegend = config.ignoreOnLegend;
    this._idSource = config.source.id;
    this._ids = config.layers.map(l => l.id);
    this._mapView = config.map;

    // Options to source
    this._sourceOptions = _.extend({}, _defaultSourceOptions);
    // remove attribute unnecessary
    delete this._sourceOptions.clusterSourceId;

    // Add to "_clusterSources"
    if (config.options.cluster) {
      this._addClusterSources(config.map, config.source.id, _defaultSourceOptions);
    }

    // Call parent init class
    App.View.Map.Layer.MapboxGLLayer.prototype
      .initialize.call(
        this,
        config.source.model,
        config.source.payload,
        config.legend,
        config.map
      );
  },

  /**
   * Add new entry to "_clusterSources"
   * 
   * @param {Object} mapView - view "App.View.Map.MapboxView"
   * @param {String} sourceId - source identification
   * @param {Object} sourceOptions - model with server data
   */
  _addClusterSources: function (mapView, sourceId, sourceOptions) {
    sourceOptions = _.defaults(sourceOptions || {}, {
      clusterSourceId: 'source-cluster'
    });

    var clusterSources = mapView._clusterSources;

    if (clusterSources.toJSON().length === 0) {
      // Add new entry
      clusterSources.add({
        id: sourceOptions.clusterSourceId,
        children: [sourceId],
        data: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        },
        options: _.extend({}, sourceOptions)
      });
    } else {
      // Add new child into the entry
      _.each(clusterSources.models, function (cluster) {
        if (cluster.get('id') === sourceOptions.clusterSourceId) {
          cluster.set('children', cluster.get('children').concat(sourceId));
        }
      });
    }
  },

  /**
   * Get the layers to draw into the map
   */
  _layersConfig: function () {
    return this.layers;
  },

  /**
   * Callback triggered when the server response is 'success'
   * 
   * @param {Object} model - model with server data
   */
  _success: function (model) {
    var response = (model.changed && model.changed.response && model.changed.response.features)
      ? model.changed.response
      : { type: 'FeatureCollection', features: [] };

    // Set the response into the source
    this._map
      .getSource(this._idSource)
      .setData(response);

    // The event is launched when the source is updated
    this.trigger('update', { id: this._idSource });

    // Update data to cluster
    this._mapView.updateDataToClusterSource();

    return model;
  },

  /**
   * Update the data layer
   * 
   * @param {String} query 
   */
  _updateData: function (query) {
    this._model.clear();
    this._model.fetch({ q: query });
  },
});
