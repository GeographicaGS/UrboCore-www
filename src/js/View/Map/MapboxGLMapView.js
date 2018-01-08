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
  _availableBasemaps: ['positron','dark'],
  _center: [0,0],
  _zoom: 12,
  _map: {},
  _layers: [],
  mapChanges: new Backbone.Model(),
  

  initialize: function(options) {
    this._currentBasemap = options.defaultBasemap || 'positron';
    this._availableBasemaps = options.availableBasemaps || ['positron','dark'];
    this._center = options.center || [0, 0];
    this._zoom = options.zoom || 12;
    this.$el[0].id = "map";
    this.$el.append(new App.View.Map.MapboxBaseMapSelectorView(this, this._availableBasemaps).render().$el);
    this._preloadBasemaps();
  },

  render: function() {
    setTimeout(()=>{
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zbW9yc290IiwiYSI6ImNqYXBvcW9oNjVlaDAyeHIxejdtbmdvbXIifQ.a3H7tK8uHIaXbU7K34Q1RA';
      this._map = new mapboxgl.Map({
        container: this.$el[0],
        style: `/mapstyles/${this._currentBasemap}.json`,
        center: this._center,
        zoom: this._zoom,
      });
      this._map
        .on('load', this.loaded.bind(this))
        .on('moveend',this.onBBoxChange.bind(this))
    },100)
    return this;
  },

  loaded: function() {
    this.mapChanges.set({'loaded':true});
  },

  onBBoxChange: function() {
    console.log(this.getBBox());
    this.mapChanges.set({'bbox':this.getBBox()});
  },

  onClose: function() {

  },

  addSource: function(idSource, dataSource) {
    let source = {id: idSource, data: dataSource};
    this._sources.push(source);
    this._map.addSource(idSource,dataSource);
    return source;
  },

  addLayers: function(layers) {
    this._layers = layers;
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
    console.log(layer._model);
    //this._map.getSource(layer._idSource).setData(data);
  },
  
  getBBox: function() {
    return this._map.getBounds();
  },

  _preloadBasemaps: function() {
    Promise.all(this._availableBasemaps.map(name => {
      return this._loadBasemap(name);
    })).then((response) => {
      Promise.all(response.map(r => r.json())).then(response => {
        this._availableBasemaps.forEach((bm, i) => {
          this.basemaps[bm] = response[i];
        });
      })
    });
  },

  _loadBasemap: function(name) {
    return fetch(`/mapstyles/${name}.json`);
  }



});

