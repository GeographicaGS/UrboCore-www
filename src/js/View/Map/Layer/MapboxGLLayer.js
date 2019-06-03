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
  popupTemplate: new App.View.Map.MapboxGLPopup('#map-mapbox_base_popup_template'),
  

  initialize: function(model, body, legend, map) {
    this._map = map;
    this._model = model;
    this.legendConfig = legend;
    this._mapEvents = {};
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
    this.addToLegend();
  },

  addToLegend: function() {
    if (this.legendConfig) {
      this._map.addToLegend(this.legendConfig);
    }
  },

  updateData: function(body) {
    this._model.clear();
    this._model.fetch({data: body});
  },

  on: function(event, ids, callback) {
    if(this._mapEvents[event] === undefined) {
      this._mapEvents[event] = {};
    }
    if(ids.constructor === Array) {
      ids.forEach(id => {
        this._map._map.on(event,id,callback);
        this._mapEvents[event][id] = callback;
      });
    }else {
      this._map._map.on(event,ids,callback);
      this._mapEvents[event][ids] = callback;      
    }
    return this;
  },

  offAll: function() {
    _.each(this._mapEvents, function(childs,event) {
      _.each(childs, function(callback, name) {
        this._map._map.off(event,name,callback);
      }.bind(this))
    }.bind(this))
  },

  onClose: function() {
    this.offAll();
  },

  /**
   * @deprecated
   */
  setInteractivity: function(label, properties = [], deviceViewLink = false) {
    console.warn('setInteractivity is DEPRECATED. Please use setPopup instead.')
    this.on('click',this.layers.map(l => l.id), function(e) {
      let mpopup = new mapboxgl.Popup()
      .setLngLat(e.lngLat);
      if(deviceViewLink) {
        deviceViewLink = deviceViewLink.replace('{{device}}',e.features[0].properties.id_entity);
      }
      mpopup.setHTML(this.popupTemplate
        .drawTemplate(label,properties, e, mpopup, deviceViewLink)).addTo(this._map._map);
    }.bind(this));
    return this;
  },

  /**
   * One template per row, each row shoud contain: 
   *  - output: HTML Output
   *  - classes: String of classes for parent.
   */
  setPopup: function(classes, label, templates = []) {
    // If it exists the attribute "hasPopup", we only apply
    // the "Popup" a these layers otherwise all layers
    // will have "Popup"
    var layersWithPopups = this.layers.filter(l => l.hasPopup).length > 0
      ? this.layers.filter(l => l.hasPopup)
      : this.layers;

    this.on('click', layersWithPopups.map(l => l.id), function(e) {
      let mpopup = new mapboxgl.Popup()
      .setLngLat(e.lngLat);

      var fullyProcessedTemplate = this.popupTemplate
        .drawTemplatesRow(classes,label,templates, e, mpopup)

      mpopup.setHTML(fullyProcessedTemplate).addTo(this._map._map);
      
    }.bind(this));
    return this;
  },

  setHoverable: function(isHoverable) {
    if (isHoverable) {
      this.on('mouseenter',_.map(this.layers,function(l) {return l.id}), function() {
        this._map._map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.on('mouseleave',_.map(this.layers,function(l) {return l.id}), function() {
        this._map._map.getCanvas().style.cursor = '';
      }.bind(this));
    }
    return this;
  },

  _success: function(change) {
    this.dataSource = (change.changed.type)? change.changed : {type: "FeatureCollection", features: []},
    this._map.getSource(this._idSource).setData(this.dataSource);
    this._map._sources.find(function(src) {
      return src.id === this._idSource;
    }.bind(this)).data = {'type': 'geojson', 'data': this.dataSource};
    return change;
  },

  _error: function() {
    console.error("Error");
  }

  
});
