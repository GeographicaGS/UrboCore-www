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
  // current cluster features
  _clusterFeatures: [],
  // Original data about the points modified
  _currentBasemap: 'positron',
  _is3dActive: false,
  // map default options
  _mapDefaultOptions: {
    center: [0, 0],
    container: null,
    clusterZoomJumps: 4,
    clusterTooltipTitle: __('Dispositivos'),
    interactive: true,
    minZoom: 0,
    maxZoom: 22,
    style: null,
    stylesPaintClusterLayer: {},
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
    'click .mapboxgl-popup .cluster-devices .info-block': 'handlerClickClusterPopup'
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
    this.$el[0].id = 'map';
    this.legend = new App.View.Map.MapboxLegendView([], this);
    this.basemapSelector = new App.View.Map.MapboxBaseMapSelectorView(this._availableBasemaps, this);
    this.$el.append(this.legend.render().$el);
    this.$el.append(this.basemapSelector.render().$el);
    this.$el.append(this.button3d);
    this.$el.append(this.zoomControl);
    this.filterModel = options.filterModel;
    // Setup cluster popup
    this.setupClusterPopup();

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
      mapboxgl.accessToken =
        'pk.eyJ1Ijoiam9zbW9yc290IiwiYSI6ImNqYXBvcW9oNjVlaDAyeHIxejdtbmdvbXIifQ.a3H7tK8uHIaXbU7K34Q1RA';
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
  dataLoaded: function () { },

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

  updateData: function (layer) { },

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
    });

    var layerClusterCircle = 'clusters-' + sourceId;
    var layerClusterNumber = 'clusters-count-' + sourceId;
    var currentMap = this._map;
    var showClusterPopup = this.showClusterPopup;
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
        paint: _.defaults(this._mapOptions.stylesPaintClusterLayer, defaultPaintOptions),
      });

      // event "click" on cluster layer
      currentMap.on('click', layerClusterCircle, function (event) {
        var features =
          currentMap.queryRenderedFeatures(
            event.point,
            { layers: [layerClusterCircle] }
          );
        var clusterId = features[0].properties.cluster_id;
        var centerMap = features[0].geometry.coordinates;

        // Show tooltip with devices inside tooltip
        if (currentMap.getZoom() + 1 == optionsLayer.clusterMaxZoom) {
          // When the "clusterEventLaunched" is true any other event
          // associated a map layer (tooltip) is launched
          App.ctx.set('clusterEventLaunched', true);

          currentMap.getSource(sourceId)
            .getClusterLeaves(clusterId, 1000, 0, function (err, clusterFeatures) {
              if (err) return;
              // Show tooltip with features (list devices)
              showClusterPopup.apply(this, [centerMap, clusterFeatures]);
            }.bind(this));

          // We do zoom
        } else if (currentMap.getZoom() < optionsLayer.clusterMaxZoom) {
          // When the "clusterEventLaunched" is true any other event
          // associated a map layer (tooltip) is launched
          App.ctx.set('clusterEventLaunched', true);

          currentMap.getSource(sourceId)
            .getClusterExpansionZoom(clusterId, function (err, zoom) {
              if (err) return;

              var clusterZoomJumps = this._mapOptions.clusterZoomJumps; // jumps maximum between zooms
              var zoomJump = Number.parseInt(optionsLayer.clusterMaxZoom/clusterZoomJumps, 10);

              zoom = zoomJump < (zoom - currentMap.getZoom())
                ? zoom
                : currentMap.getZoom() + zoomJump;

              if (zoom > optionsLayer.clusterMaxZoom) {
                zoom = optionsLayer.clusterMaxZoom;
              }

              // to fix problem with the last zoom
              if (zoom === currentMap.getZoom()) {
                zoom = currentMap.getMaxZoom();
              }

              currentMap.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
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
          'text-allow-overlap': true,
          'text-size': 12
        },
        paint: {
          'text-color': '#FFF'
        }
      });
    }
  },

  /**
   * Setup cluster popup to show the devices list
   */
  setupClusterPopup: function () {
    // Cluster template
    this._clusterPopupTemplate = new App.View.Map.MapboxGLPopup('#map-mapbox_base_popup_template');

    // Create cluster popup
    if (!this._clusterPopup) {
      this._clusterPopup = new mapboxgl.Popup();

      // Change context variable 'mapTooltipIsShow' when tooltip is closed
      this._clusterPopup.on('close', function () {
        App.ctx.set('mapTooltipIsShow', false);
      });
    }
  },

  /**
   * Show cluter popup with feature inside it
   *
   * @param {Object} position - geography position
   * @param {Array} features - features to show
   */
  showClusterPopup: function (position, features) {
    // get each items with its template
    var itemsTemplate = _.reduce(features, function (sumFeatures, feature) {
      var layerView = this.findCurrentLayerToTooltip(feature.properties.id_entity);

      sumFeatures.push({
        output: App.View.Map.RowsTemplate.CLUSTER_ROW,
        properties: [{
          label: layerView && typeof layerView.getSymbolToClusterTooltip === 'function'
            ? layerView.getSymbolToClusterTooltip(feature)
            : null,
          value: feature.properties.id_entity + '| exactly',
        }]
      })
      return sumFeatures;
    }.bind(this), []);
    // get all items template together
    var allTemplatesDone = this._clusterPopupTemplate
      .drawTemplatesRow(
        'cluster-devices',
        this._mapOptions.clusterTooltipTitle,
        itemsTemplate,
        null,
        this._clusterPopup
      );

    // To use later in "handlerClickClusterPopup"
    this._clusterFeatures = features;

    // Draw the cluster in the map
    this._clusterPopup
      .setLngLat({ lat: position[1], lng: position[0] })
      .setHTML(allTemplatesDone)
      .addTo(this._map);

    // Change context variable 'mapTooltipIsShow'
    App.ctx.set('mapTooltipIsShow', true);
  },

  /**
   * handler click on "button" cluster tooltip (devices list)
   *
   * @param {Object} e - triggered event
   */
  handlerClickClusterPopup: function (e) {
    // get some parameters to use in the new modal
    var entityId = $(e.currentTarget).data('entity-id');
    var currentFeature = _.find(this._clusterFeatures, function (feature) {
      return feature.properties.id_entity === entityId;
    });
    var coordinates = this._clusterPopup._lngLat;
    var layerView = this.findCurrentLayerToTooltip(entityId);

    // close current popup
    this._clusterPopup.remove();

    // Show tooltip entity
    if (layerView) {
      // Draw the cluster in the map
      this._clusterPopup
        .setLngLat(coordinates)
        .setHTML(
          this._clusterPopupTemplate
            .drawTemplatesRow(
              layerView.options
                ? layerView.options.tooltipCSSClass || ''
                : '',
              layerView.options
                ? layerView.options.tooltipTitle || ''
                : '',
              typeof layerView.getContentTooltip === 'function'
                ? layerView.getContentTooltip({
                    features: [currentFeature] // this format is to avoid to change original function
                  })
                : [],
                {
                  features: [currentFeature] // this format is to avoid to change original function
                },
              this._clusterPopup
            )
        )
        .addTo(this._map);

      // Change context variable 'mapTooltipIsShow'
      App.ctx.set('mapTooltipIsShow', true);
    }
  },

  /**
   * Find layer (Backbone.View) that it uses the
   * source data that contains the entity indicated
   *
   * @param {String} entityId - entity id
   * @return {Object} - Backbone.View
   */
  findCurrentLayerToTooltip: function (entityId) {
    // all map sources
    var sources = this._map.style.sourceCaches;
    // selected cluster source id when we create the layer
    var clusterSourceId = _.reduce(this.layers, function (sourceId, layer) {
      if (layer.options && layer.options.cluster && layer.options.clusterSourceId) {
        sourceId = layer.options.clusterSourceId;
      }
      return sourceId;
    }, null);
    // current source id used in the layer
    var currentSourceId = _.reduce(Object.keys(sources), function (sourceId, key) {
      if (key !== 'openmaptiles' && key !== clusterSourceId) {
        var features = sources[key]._source
          && sources[key]._source._data
          && sources[key]._source._data.features
          ? sources[key]._source._data.features
          : [];

        if (_.find(features, function (feature) {
          return feature.properties.id_entity === entityId;
        })) {
          sourceId = key;
        }
      }
      return sourceId;
    }, null);
    // I looking for the used layer (Backbone.View)
    // to use its tooltip design
    var currentLayerView = _.find(this.layers, function (layer) {
      if (layer.layersView) {
        return _.find(layer.layersView, function (layersView) {
          return layersView._idSource === currentSourceId;
        });
      }
      return false;
    });

    return currentLayerView;
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
    } else {
      this._map.setZoom(currentZoom + 1);
    }

    // close current popup
    this._clusterPopup.remove();
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

