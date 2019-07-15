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

App.View.Map.VectorPoints = App.View.Map.LayerMap.extend({
  _markerPopupTemplate: _.template($('#map-entity_popup_template').html()),

  initialize: function (options) {
    App.View.Map.LayerMap.prototype.initialize.call(this, options);

    this._layerGroups = {};
    this._markers = {};
    this._alertGroup = {};
  },

  filtersLayer: function (m) {
    this._createLayerGroup(m);
  },

  changeBBOX: function () {
    if (this._ctx.get('bbox_status')) {
      for (var i = 0; i < this.layers.length; i++) {
        var m = this.layers.at(i);
        var totals = m.get('totals');
        totals.filter = this._elementsAtBBOX(this._layerGroups[m.get('id')]);

        // Force a change because we're updating the object
        m.trigger('change:totals');
      }
    }
  },

  toggleLayer: function (m) {
    var layer = this._layerGroups[m.get('id')];
    var alerts = this._alertGroup[m.get('id')];
    if (m.get('enable')) {
      this.map.addLayer(layer);
      if (alerts) {
        this.map.addLayer(alerts);
      }
    } else {
      this.map.removeLayer(layer);
      if (alerts) {
        this.map.removeLayer(alerts);
      }

    }
  },

  changeDate: function () {
    // Nothing to do
  },

  _elementsAtBBOX: function (layergroup) {
    var bounds = this.map.getBounds();
    var features = layergroup.getLayers();
    var c = 0;

    for (var f in features) {
      var coord = features[f]._latlng;
      if (bounds.contains(coord)) c++;
    }

    return c;

  },

  render: function () {
    // Call render parent class
    App.View.Map.LayerMap.prototype.render.call(this);

    // Layers to draw
    this.layersDevices = new App.Collection.DevicesMap(null, { 
      scope: this.options.scope 
    });
    this.layersDevices.fetch(this.getRequestDataToLayers());
    this.listenTo(this.layersDevices, 'reset', this._renderPoints);

    // refresh
    if (this.options.refresh) {
      this._interval = setInterval(function () {
        _this.layersDevices.fetch(this.getRequestDataToLayers());
      }.bind(this), this.options.refresh);
    }

    return this;
  },

  _renderPoints: function () {
    this.$('.loading.map').addClass('hiden');

    var devices = this.layersDevices.toJSON();

    for (var i = 0; i < this.layers.length; i++) {
      var m = this.layers.at(i);
      var markers = _.filter(devices, function (p) {
        return p.properties.entity_id === m.get('id');
      });
      this._createLayerGroup(m, markers);
    }
  },

  _createLayerGroup: function (model) {
    var data = this.layersDevices.toJSON();
    var _this = this;

    var layer = this._layerGroups[model.get('id')];
    var alerts = this._alertGroup[model.get('id')];

    // Removing previous layers
    if (layer) {
      this.map.removeLayer(layer);
    }

    // Removing previous alerts
    if (alerts) {
      this.map.removeLayer(alerts);
    }

    this._alertGroup[model.get('id')] = L.layerGroup();
    this._alertGroup[model.get('id')]
      .addTo(this.map);

    var icon = L.icon({
      iconUrl: '/img/' + model.get('iconm'),
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, 0],
    });

    var filterFn = model.get('filterFn');
    var filters = model.get('filters');
    var fn;

    if (filters && filterFn) {
      fn = filterFn(filters);
    }

    var totals = {
      filter: 0,
      all: 0
    };

    var bounds = this.map.getBounds();
    var opts = {
      onEachFeature: function (feature, layer) {
        feature.properties.name = model.has('titleTooltip')
          ? model.get('titleTooltip')
          : model.get('title');
        feature.properties.scope = _this.options.scope;
        layer.bindPopup(_this._markerPopupTemplate(feature.properties));
      },

      pointToLayer: function (feature, latlng) {
        var alertColor = null;
        _.each(feature.properties.lastdata, function (l) {
          var metaData = App.Utils.toDeepJSON(App.mv().getVariable(l.var));
          var thresholds = metaData.var_thresholds;
          if (l.value) {
            if (!metaData.reverse) {
              if (l.value >= thresholds[2] && thresholds[2]) {
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.ERROR);
              } else if (!alertColor && l.value >= thresholds[1] && thresholds[1]) {
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.WARNING);
              }
            } else {
              if (l.value <= thresholds[1] && thresholds[1]) {
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.ERROR);
              } else if (!alertColor && l.value <= thresholds[2] && thresholds[2]) {
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.WARNING);
              }
            }
          }
        });
        if (alertColor) {
          var alertOptions = {
            radius: 12,
            weight: 0,
            fillOpacity: 0,
            color: alertColor,
            className: 'alert_map'
          };
          var markerAlert = L.circleMarker(latlng, alertOptions);
          _this._alertGroup[model.get('id')].addLayer(markerAlert);
        }

        return L.marker(latlng, { icon: icon })
      },

      filter: function (feature, layer) {
        if (feature.properties.entity_id != model.get('id'))
          return false;

        totals.all++;

        var filter = fn ? fn(feature.properties) : true;

        if (_this._ctx.get('bbox')) {
          if (bounds.contains([
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0]
          ])) {
            totals.filter++;
          }
        } else {
          totals.filter++;
        }

        return filter;
      }
    };


    var geojson = L.geoJson(data, opts);
    this._layerGroups[model.get('id')] = geojson;

    if (model.get('enable'))
      geojson.addTo(this.map);

    model.set('totals', totals);
  },

  /**
   * Get request data to get data about layers to draw
   * 
   * @return {Object} - Options to request data to layers
   */
  getRequestDataToLayers: function () {
    return {
      reset: true, 
      data: { 
        entities: this.layers.length > 0
          ? _.pluck(this.layers.toJSON(), 'id').join(',')
          : null,
        geojson: true 
      } 
    }
  },

  /**
   * Launching when the View is "closed"
   */
  onClose: function () {
    if (this._interval) {
      clearInterval(this._interval);
    }

    if (this.map) {
      this.map.remove();
    }

    App.ctx.set('bbox', null);
  },

});
