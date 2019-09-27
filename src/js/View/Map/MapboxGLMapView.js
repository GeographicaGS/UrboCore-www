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
  _availableBasemaps: ['positron', 'dark', 'ortofoto'],
  // Differents cluster sources
  _clusterSources: new Backbone.Collection([]),
  // Original data about the points modified
  _clusterSourcesSaved: [],
  _currentBasemap: 'positron',
  _is3dActive: false,
  // map default options
  _mapDefaultOptions: {
    center: [0, 0],
    container: null,
    distancePointToCluster: 40, //metres
    interactive: true,
    minZoom: 0,
    maxZoom: 22,
    style: null,
    zoom: 12,
  },
  _map: {},
  _layers: [],
  _sources: [],
  mapChanges: new Backbone.Model(),
  button3d: '<div class="toggle-3d"></div>',
  zoomControl: '<div class="zoom-control">'
    + '<div class="control in"> + </div>'
    + '<div class="control out"> - </div>'
    + '</div>',

  events: {
    'click .toggle-3d': 'toggle3d',
    'click .control.in': 'zoom',
    'click .control.out': 'zoom',
  },

  initialize: function (options) {
    this._options = options;
    // Merge user options with default map options
    this._mapOptions = _.defaults({}, this._mapDefaultOptions);
    this._mapOptions = _.reduce(options, function (sumOptions, option, index) {
      if (sumOptions[index]) {
        sumOptions[index] = option;
      }
      return sumOptions;
    }, this._mapOptions);

    this._currentBasemap = options.defaultBasemap || 'positron';
    this._availableBasemaps = options.availableBasemaps || ['positron', 'dark', 'ortofoto'];
    this._sprites = options.sprites;
    this.$el[0].id = "map";
    this.legend = new App.View.Map.MapboxLegendView([], this);
    this.basemapSelector = new App.View.Map.MapboxBaseMapSelectorView(this._availableBasemaps, this);
    this.$el.append(this.legend.render().$el);
    this.$el.append(this.basemapSelector.render().$el);
    this.$el.append(this.button3d);
    this.$el.append(this.zoomControl);
    this.filterModel = options.filterModel;

    this.listenTo(App.ctx, 'change:bbox_status', this._changeBBOXStatus);
    this.listenTo(App.ctx, 'change:start change:finish', function () {
      if (options.filterModel) {
        options.filterModel.set('time', App.ctx.getDateRange());
      }
    }.bind(this));

    // filterModel change
    if (options.filterModel) {
      this.listenTo(options.filterModel, 'change', _.bind(function () {
        this._applyFilter();
        this._applyFilterToCluster();
      }, this));
    }

    // refresh map
    if (options.autoRefresh) {
      this.realTime = setInterval(function () {
        this._applyFilter(options.filterModel);
      }.bind(this), options.autoRefresh);
    }

    _.bindAll(this, 'dataLoaded');
  },

  render: function () {
    setTimeout(() => {
      // TODO: move token to settings
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zbW9yc290IiwiYSI6ImNqYXBvcW9oNjVlaDAyeHIxejdtbmdvbXIifQ.a3H7tK8uHIaXbU7K34Q1RA';
      this._preloadBasemaps()
        .then(function () {
          // New map
          this._map = new mapboxgl.Map(
            _.defaults(
              {
                container: this.$el[0],
                style: this.basemaps['positron'],
              },
              this._mapOptions)
          );

          // Bind some events
          this._map
            .on('load', this.loaded.bind(this))
            .on('moveend', this.bboxChanged.bind(this))
            .on('dataloading', this.dataLoaded);

        }.bind(this));
    }, 100)
    return this;
  },

  /**
   * This event is called after map is loaded.
   */
  loaded: function () {
    this.mapChanges.set({ 'loaded': true });
    this._onMapLoaded();
    // Add cluster sources to map
    this.addClusterSourcesToMap();
    // We disable the variable
    App.ctx.set('clusterEventLaunched', false);
    // We disable the tooltips
    App.ctx.set('mapTooltipIsShow', false);
  },

  /**
   * This event is called after data in map is loaded.
   * Implement in child class
   */
  dataLoaded: function () {},

  /**
   * This event is called after data in map is moved.
   */
  bboxChanged: function () {
    let bbox = this.getBBox();
    this.mapChanges.set({ 'bbox': bbox });
    this._onBBoxChange(bbox);
  },

  /**
   * This event is called after map is moved.
   * Implement in child class
   */
  _onBBoxChange: function (bbox) { },

  /**
   * This event is called after map loaded.
   * Implement in child class
   */
  _onMapLoaded: function () { },

  /**
   * Reset BBox
   */
  _resetBBox: function () {
    // Reset BBOX
    App.ctx.set('bbox', null);
    App.ctx.set('bbox_info', false);
    App.ctx.set('bbox_status', false);
  },

  /**
   * Add "source" data to the map
   *
   * @param {String} idSource - identification source (name source)
   * @param {Object} dataSource - data about the source
   * @return {Object} - the added source
   */
  addSource: function (idSource, dataSource) {
    var source = {
      id: idSource,
      data: dataSource
    };
    var src = this._sources.find(function (src) {
      return source.id === src.id;
    }.bind(this));

    if (!src) {
      this._sources.push(source);
    }

    // Add source map
    this._map.addSource(idSource, dataSource);

    return source;
  },

  /**
   * Get the about the id source
   *
   * @param {String} idSource - id source data
   * @return {Object} data about the source
   */
  getSource: function (idSource) {
    return typeof idSource === 'string'
      ? this._map.getSource(idSource)
      : undefined;
  },

  updateData: function (layer) {},

  /**
   * Add layers to the map
   *
   * @param {Array} layers - layers collection to draw in the map
   */
  addLayers: function (layers) {
    _.each(layers, function (layer) {
      if (typeof this._map.getLayer(layer.id) === 'undefined') {
        // Add layers to map
        this._map.addLayer(layer);
      }
    }.bind(this));
  },

  /**
   * Add "_clusterSources" to the map
   */
  addClusterSourcesToMap: function () {
    _.each(this._clusterSources.toJSON(), function (element) {
      if (typeof this._map.getSource(element.id) === 'undefined') {
        var options = {
          type: element.data.type,
          data: element.data.data,
          cluster: element.options.cluster,
          clusterMaxZoom: element.options.clusterMaxZoom,
          clusterRadius: element.options.clusterRadius
        };
        // Add the source cluster
        this.addSource(element.id, options);
        // Setup the cluster layers
        this.setupClusterLayer(element.id, element.options || null);
      }
    }.bind(this));

    // The event is launched when all sources cluster
    // were added to map
    this.trigger('added-cluster');
  },

  /**
   * reset "_clusterSources"
   */
  resetClusterSourcesToMap: function () {
    this._clusterSources.reset();
  },

  /**
   * update data (update) to array "_clusterSources"
   */
  updateDataToClusterSource: function () {
    // reset data from "_clusterSources"
    _.each(this._clusterSources.models, function (cluster) {
      cluster.set('data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }.bind(this));

    // Add data to each source data in "_clusterSource"
    _.each(this._clusterSources.models, function (cluster) {
      // Get all points from source relationated
      var features = [];
      var clusterChildren = cluster.get('children');

      _.each(this._map.getStyle().sources, function (source, sourceId) {
        if (source.cluster &&
          source.type === 'geojson' &&
          source.data.features &&
          source.data.features.length > 0 &&
          clusterChildren.includes(sourceId)) {
          // We fill the "features" variable
          _.each(source.data.features, function (item) {
            features.push(item);
          });
        }
      }.bind(this));

      // We fill the data
      if (features.length > 0 && 
        typeof this._map.getSource(cluster.get('id')) !== 'undefined') {
        // Set the response into the source
        this._map.getSource(cluster.get('id'))
          .setData({
            type: 'FeatureCollection',
            features: features
          });

        // Set in model
        cluster.set('data', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features
          }
        });
      }

    }.bind(this));
  },

  /**
   * Setup the cluster layer associated to source id
   * 
   * IMPORTANT - this in only possible in the layers with GEOJSON
   *
   * @param {String} sourceId - source identification
   * @param {Object} optionsLayer - options to setup the cluster layer
   */
  setupClusterLayer: function (sourceId, optionsLayer) {

    // Default options
    optionsLayer = _.defaults(optionsLayer || {}, {
      clusterRadius: 50,
      clusterMaxZoom: 17,
      paint: null,
    });

    var layerClusterCircle = 'clusters-' + sourceId;
    var layerClusterNumber = 'clusters-count-' + sourceId;
    var currentMap = this._map;
    var findAndSaveSourceFromFeature = this._findAndSaveSourceFromFeature;
    var modifyAndSetSources = this._modifyAndSetSources;
    var resetClusterSources = this._resetClusterSourcesSaved;
    var defaultPaintOptions = {
      'circle-color': '#909599',
      'circle-radius': 20
    };

    /**
     * Draw the colour circles (cluster)
     */
    if (!currentMap.getLayer(layerClusterCircle)) {
      // Add layer to map
      currentMap.addLayer({
        id: layerClusterCircle,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: optionsLayer.paint
          ? paintOptions.paint
          : defaultPaintOptions,
      });

      // event "click" on cluster layer
      currentMap.on('click', layerClusterCircle, function (event) {
        var features = 
          currentMap.queryRenderedFeatures(
            event.point,
            { layers: [layerClusterCircle]}
        );
        var clusterId = features[0].properties.cluster_id;
        var centerMap = features[0].geometry.coordinates;

        // Event - we do zoom
        if (currentMap.getZoom() < optionsLayer.clusterMaxZoom) {
          // When the "clusterEventLaunched" is true any other event
          // associated a map layer (tooltip) is launched
          App.ctx.set('clusterEventLaunched', true);

          currentMap.getSource(sourceId)
            .getClusterExpansionZoom(clusterId, function (err, zoom) {
              if (err) return;
              currentMap.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            });
        }

        // Event- move the features (icons) that 
        // they are in the same position
        if (currentMap.getZoom() >= optionsLayer.clusterMaxZoom) {
          // When the "clusterEventLaunched" is true any other event
          // associated a map layer (tooltip) is launched
          App.ctx.set('clusterEventLaunched', true);

          currentMap.getSource(sourceId)
          .getClusterLeaves(clusterId, 100, 0, function (err, clusterFeatures) {
            // reset the points
            resetClusterSources.apply(this);
            _.each(clusterFeatures, function (clusterFeature) {
              // Find any source associated to Feature and save it
              findAndSaveSourceFromFeature.apply(this, [clusterFeature]);
            }.bind(this));
            // Prepare and modify source data and set into source
            modifyAndSetSources.apply(this, [centerMap]);
          }.bind(this));
        }

        return false;
      }.bind(this));

      // event "mouseenter" on cluster layer (change styles)
      currentMap.on('mouseenter', layerClusterCircle, function () {
        currentMap.getCanvas().style.cursor = 'pointer';
      });
      // event "mouseleave" on cluster layer (change styles)
      currentMap.on('mouseleave', layerClusterCircle, function () {
        currentMap.getCanvas().style.cursor = '';
      });
    }

    /**
     * Draw the layer shows the items number (cluster)
     */
    if (!currentMap.getLayer(layerClusterNumber)) {
      currentMap.addLayer({
        id: layerClusterNumber,
        hasPopup: false, // To show "popup" when click on this layer
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12
        },
        paint: {
          'text-color': '#FFF'
        }
      });
    }
  },

  /**
   * Apply filter over all layers
   */
  _applyFilter: function () {
    // Extend on implementation
  },

  /**
   * Apply filter over source cluster
   */
  _applyFilterToCluster: function () {
    // Extend on implementation
  },

  /**
   * Get the layers from a feature (device in map)
   * 
   * @param {Object} feature - feature to search
   * @return {Object} - source from feature
   */
  _findAndSaveSourceFromFeature: function (feature) {
    var clusterSources = this._clusterSources.toJSON(); // clusters map
    var dataSource = null;
    var index = 0;

    do {
      var tmpSource = _.find(clusterSources[index].children, function (source) {
        // Get data source
        var currentSourceData = this.getSource(source);

        // We looking for the element "feature"
        return typeof currentSourceData !== 'undefined'
          ? _.some(currentSourceData._data.features, function (currentFeature) {
              return feature.properties.id_entity === currentFeature.properties.id_entity;
            }.bind(this))
          : false;
      }.bind(this));

      if (typeof tmpSource !== 'undefined') {
        dataSource = this.getSource(tmpSource);
      }
      
      index++;

    } while (dataSource === null || index < clusterSources.length);

    // Save source into the "_clusterSourcesSaved"
    this._saveClusterSourcesSaved(dataSource, feature.properties.id_entity);
  },

  /**
   * Save (set) a new entry in variable "_clusterSourcesSaved"
   * 
   * @param {Object} sourceData - data about the cluster sources
   * @param {String} entity_id - entity_id associated to feature
   */
  _saveClusterSourcesSaved: function (sourceData, entity_id) {
    var sourceIndex = this._clusterSourcesSaved.findIndex(function (source) {
      return source.data.id === sourceData.id;
    });

    if (sourceIndex > -1) {
      this._clusterSourcesSaved[sourceIndex]
        .entities.push(entity_id);
    } else {
      this._clusterSourcesSaved.push({
        data: _.extend({}, sourceData),
        entities: [entity_id]
      });
    }
  },

  /**
   * Modify the differents sources associated to cluster to show the
   * draw point in map like a cicle
   * 
   * @param {Array} centerMap - array with coordinates
   */
  _modifyAndSetSources: function (centerMap) {
    // Copy from "_clusterSourcesSaved"
    var _copyClusterSourcesSaved = _.reduce(this._clusterSourcesSaved, function (sumSources, source) {
      sumSources.push(_.clone(source));
      return sumSources;
    }, []);

    var totalItems = _.reduce(_copyClusterSourcesSaved, function (sumTotal, source) {
      sumTotal += source.entities.length;
      return sumTotal;
    }, 0);
    var angle = 360/totalItems;
    var matchIndex = 0;

    _.each(_copyClusterSourcesSaved, function (source, sourceIndex) {
      var modifyFeatures = [];
      _.each(source.data._data.features, function (feature, featureIndex) {
        // Modify the point and save
        if (source.entities.includes(feature.properties.id_entity)) {
          var newPosition = this._calculateNewPosition(
            centerMap,
            {
              distance: this._mapOptions.distancePointToCluster || 40,
              bearing: angle*matchIndex,
              options: {
                units: 'meters'
              }
            }
          );
          // Add to index
          matchIndex++;
        }

        // Set new value into the sources data
        modifyFeatures.push({
          geometry: newPosition && newPosition.geometry
            ? newPosition.geometry
            : feature.geometry,
          properties: feature.properties,
          type: feature.type
        })

      }.bind(this));

      // Set the modify data into the source
      this._map.getSource(source.data.id)
        .setData(
          {
            type: 'FeatureCollection',
            features: modifyFeatures
          });

    }.bind(this));
  },

  /**
   * Reset the cluster sources modify with the original
   */
  _resetClusterSourcesSaved: function () {
    _.each(this._clusterSourcesSaved, function (source) {
      // Set the modify data into the source
      this._map.getSource(source.data.id)
        .setData(source.data._data);
    }.bind(this));
    // reset Array
    this._clusterSourcesSaved = [];
  },

  /**
   * Get a new coordinate (point) when we have a source
   * point and other options
   * 
   * @param {Array} coordinate - coordinate point
   * @param {Object} params - options various
   * @return {Object} - new point
   */
  _calculateNewPosition: function (coordinate, params) {
    return App.Utils.getPointByDistanceAndAngle(coordinate, params);
  },

  changeBasemap: function (name) {
    this._map.setStyle(this.basemaps[name]);
    this._currentBasemap = name;
    let sources = [];
    this._sources.forEach(src => {
      sources.push(this.addSource(src.id, src.data));
    });
    this._sources = sources;
    this.addLayers(this._layers);
  },

  getBBox: function () {
    return this._map.getBounds();
  },

  _preloadBasemaps: function () {
    let promise = new Promise(function (resolve, reject) {
      Promise.all(this._availableBasemaps.map(name => {
        return this._loadBasemap(name);
      })).then((response) => {
        Promise.all(response.map(r => r.json())).then(response => {
          this._availableBasemaps.forEach((bm, i) => {
            this.basemaps[bm] = response[i];

            if (this._sprites) {
              this.basemaps[bm].sprite = window.location.origin + this._sprites;
            }
            resolve();
          });
        })
      });
    }.bind(this));
    return promise;
  },

  _loadBasemap: function (name) {
    return fetch(`/mapstyles/${name}.json`);
  },

  resetSize: function () {
    this._map.resize();
  },

  _changeBBOXStatus: function () {
    if (App.ctx.get('bbox_status'))
      App.ctx.set('bbox', this._getCurrentBBOX());
    else
      App.ctx.set('bbox', null);
  },

  _getCurrentBBOX: function () {
    let bbox = this.getBBox();
    return [bbox.getNorthEast().lng, bbox.getNorthEast().lat, bbox.getSouthWest().lng, bbox.getSouthWest().lat]
  },

  toggle3d: function (e) {
    this._is3dActive = !this._is3dActive;
    e.target.classList.toggle('active');
    this._map.setPitch(this._is3dActive ? 50 : 0);
    // This event is called after 3d button is clicked.
    // Extend on implementation.
  },

  addToLegend: function (item) {
    this.legend.addItemLegend(item);
  },

  drawLegend: function () {
    this.legend.drawLegend();
  },

  clearLegend: function () {
    this.legend.removeLegendItems();
  },

  zoom: function (e) {
    var currentZoom = this._map.getZoom();
    if (e.target.classList.contains('out')) {
      this._map.setZoom(currentZoom - 1);
      // reset positions
      if (currentZoom > this._mapOptions.minZoom) {
        this._resetClusterSourcesSaved();
      }
    } else {
      this._map.setZoom(currentZoom + 1);
      // reset positions
      if (currentZoom < this._mapOptions.maxZoom) {
        this._resetClusterSourcesSaved();
      }
    }
  },

  /**
   * Launched when the view is closed
   */
  onClose: function () {
    if (this.realTime) {
      clearInterval(this.realTime);
    }
    this._map.remove();
    this.stopListening();
    this.basemapSelector.close(),
    this.legend.close();

    // reset cluster sources
    this.resetClusterSourcesToMap();

    // Reset BBOX
    this._resetBBox();
  },
});

