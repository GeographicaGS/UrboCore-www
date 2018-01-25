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
  _sources: [],
  _currentBasemap: 'positron',
  _availableBasemaps: ['positron','dark','ortofoto'],
  _center: [0,0],
  _zoom: 12,
  _map: {},
  _layers: [],
  _is3dActive: false,
  mapChanges: new Backbone.Model(),
  button3d: '<div class="toggle-3d"></div>'  ,

  events: {
    'click .toggle-3d': 'toggle3d'
  },

  initialize: function(options) {
    this._options = options;
    this._currentBasemap = options.defaultBasemap || 'positron';
    this._availableBasemaps = options.availableBasemaps || ['positron','dark','ortofoto'];
    this._sprites = options.sprites;
    this._center = options.center || [0, 0];
    this._zoom = options.zoom || 12;
    this.$el[0].id = "map";
    this.legend = new App.View.Map.MapboxLegendView([], this);
    this.basemapSelector = new App.View.Map.MapboxBaseMapSelectorView(this._availableBasemaps, this);
    this.$el.append(this.legend.render().$el);
    this.$el.append(this.basemapSelector.render().$el);
    this.$el.append(this.button3d);
    this.listenTo(App.ctx,'change:bbox_status',this._changeBBOXStatus);    
  },

  render: function() {
    setTimeout(()=>{
      // TODO: move token to settings
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zbW9yc290IiwiYSI6ImNqYXBvcW9oNjVlaDAyeHIxejdtbmdvbXIifQ.a3H7tK8uHIaXbU7K34Q1RA';
      this._preloadBasemaps().then(function() {
        this._map = new mapboxgl.Map({
          container: this.$el[0],
          style: this.basemaps['positron'],
          center: this._center,
          zoom: this._zoom,
        });
        this._map
          .on('load', this.loaded.bind(this))
          .on('moveend',this.bboxChanged.bind(this))
      }.bind(this));
    },100)
    return this;
  },

  loaded: function() {
    this.mapChanges.set({'loaded':true});
    this._onMapLoaded();
  },

  bboxChanged: function() {
    let bbox = this.getBBox();
    this.mapChanges.set({'bbox': bbox});
    this._onBBoxChange(bbox);
  },

  _onBBoxChange: function(bbox) {
    // This event is called after map moved.
    // Override for bbox changes actions.
  },

  _onMapLoaded: function() {
    // This event is called after map loaded.
    // Place your layers here.
  },

  onClose: function() {
    this._map.remove();
    this.stopListening();
    this.basemapSelector.close(),
    this.legend.close();
  },

  addSource: function(idSource, dataSource) {
    let source = {id: idSource, data: dataSource};
    let src =  this._sources.find(function(src) {
      return source.id === src.id;
    }.bind(this));
    if(!src) {
      this._sources.push(source);
    }
    this._map.addSource(idSource,dataSource);
    return source;
  },

  getSource: function(idSource) {
    return this._map.getSource(idSource);
  },

  addLayers: function(layers) {
    layers.forEach(layer => {
      this._map.addLayer(layer);
    });
  },

  changeBasemap: function(name) {
    this._map.setStyle(this.basemaps[name]);
    this._currentBasemap = name;
    let sources = [];
    this._sources.forEach(src => {
      sources.push(this.addSource(src.id, src.data));
    });
    this._sources = sources;
    this.addLayers(this._layers);
  },

  updateData: function(layer) {
    //this._map.getSource(layer._idSource).setData(data);
  },
  
  getBBox: function() {
    return this._map.getBounds();
  },

  _preloadBasemaps: function() {
    let promise = new Promise(function(resolve,reject) {
      Promise.all(this._availableBasemaps.map(name => {
        return this._loadBasemap(name);
      })).then((response) => {
        Promise.all(response.map(r => r.json())).then(response => {
          this._availableBasemaps.forEach((bm, i) => {
            this.basemaps[bm] = response[i];
            this.basemaps[bm].sprite = window.location.origin + this._sprites;
            resolve();
          });
        })
      });
    }.bind(this));
    return promise;
  },

  _loadBasemap: function(name) {
    return fetch(`/mapstyles/${name}.json`);
  },

  resetSize: function() {
    this._map.resize();
  },

  _changeBBOXStatus: function() {
    if (App.ctx.get('bbox_status'))
      App.ctx.set('bbox', this._getCurrentBBOX());
    else
      App.ctx.set('bbox', null);
  },

  _getCurrentBBOX: function() {
    let bbox = this.getBBox();
    return [bbox.getNorthEast().lng,bbox.getNorthEast().lat,bbox.getSouthWest().lng,bbox.getSouthWest().lat]
  },
  
  toggle3d: function(e) {
    this._is3dActive = !this._is3dActive;
    e.target.classList.toggle('active');
    this._map.setPitch(this._is3dActive ? 50 : 0);
    // This event is called after 3d button is clicked.
    // Extend on implementation.
  },

  addToLegend: function(item) {
    this.legend.addItemLegend(item);
  },

  drawLegend: function() {
    this.legend.drawLegend();
  }
});

