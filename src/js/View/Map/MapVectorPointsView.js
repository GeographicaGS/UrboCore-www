'use strict';

App.View.Map.VectorPoints = App.View.Map.LayerMap.extend({
  _markerPopupTemplate: _.template( $('#map-entity_popup_template').html() ),

  initialize: function(options) {
    //_.bindAll(this,'_onNamedMapCreated','_onFeatureClick');
    App.View.Map.LayerMap.prototype.initialize.call(this,options);
    this._layerGroups = {};
    this._markers = {};
    this._alertGroup = {};
  },

  onClose: function(){
    if (this._interval)
      clearInterval(this._interval);

    if (this.map)
      this.map.remove();

    App.ctx.set('bbox',null);
  },

  filtersLayer: function(m){
    this._createLayerGroup(m);
  },

  changeBBOX: function(){
    if (this._ctx.get('bbox_status')){
      for (var i=0;i<this.layers.length;i++){
        var m = this.layers.at(i);
        var totals = m.get('totals');
        totals.filter = this._elementsAtBBOX(this._layerGroups[m.get('id')]);

        // Force a change because we're updating the object
        m.trigger('change:totals');
      }
    }
  },

  toggleLayer: function(m){
    var layer = this._layerGroups[m.get('id')];
    var alerts = this._alertGroup[m.get('id')];
    if (m.get('enable')){
      this.map.addLayer(layer);
      if(alerts){
        this.map.addLayer(alerts);
      }
    }else{
      this.map.removeLayer(layer);
      if(alerts){
        this.map.removeLayer(alerts);
      }

    }
  },

  changeDate: function(){
    // Nothing to do
  },

  _elementsAtBBOX: function(layergroup){
    var bounds = this.map.getBounds();
    var features = layergroup.getLayers();
    var c = 0;
    for (var f in features){
      var coord = features[f]._latlng;
      if (bounds.contains(coord))
        c++;
    }

    return c;

  },

  render: function(){
    App.View.Map.LayerMap.prototype.render.call(this);
    this.layersDevices = new App.Collection.DevicesMap(null,{scope: this.options.scope});
    this.listenTo(this.layersDevices,"reset",this._renderPoints);
    var entities = _.pluck(this.layers.toJSON(),'id');
    this.layersDevices.fetch({ reset: true, data: { 'entities': entities.join(','), 'geojson' : true}});

    if (this.options.refresh){
      var _this = this;
      this._interval = setInterval(function(){
        _this.layersDevices.fetch({ reset: true, data: { 'entities': entities.join(','), 'geojson' : true}});
      }, this.options.refresh);
    }

    return this;
  },

  _renderPoints: function(){
    this.$('.loading.map').addClass('hiden');
    var devices = this.layersDevices.toJSON();

    for (var i=0;i<this.layers.length;i++){
      var m = this.layers.at(i);
      // get markers for this collection
      var markers = _.filter(devices,function(p){
        return p.properties.entity_id == m.get('id');
      });
      this._createLayerGroup(m,markers);
    }
  },

  _createLayerGroup : function(model){

    var data = this.layersDevices.toJSON();
    var _this = this;

    var layer = this._layerGroups[model.get('id')];
    if (layer)
      this.map.removeLayer(layer);

    var alerts = this._alertGroup[model.get('id')];
    if(alerts)
      this.map.removeLayer(alerts);

    this._alertGroup[model.get('id')] = L.layerGroup();
    this._alertGroup[model.get('id')].addTo(this.map);

    var icon = L.icon({
      iconUrl: '/img/' + model.get('iconm'),
	    iconSize:     [32, 32],
	    iconAnchor:   [16, 16],
	    popupAnchor:  [0, 0],
	  });

    var filterFn = model.get('filterFn');
    var filters = model.get('filters');
    var fn;

    if (filters && filterFn){
      fn = filterFn(filters);
    }

    var totals = {
      filter: 0,
      all: 0
    };

    var bounds = this.map.getBounds();
    var opts = {
      onEachFeature: function (feature, layer) {
        feature.properties.name = model.get('title');
        feature.properties.scope = _this.options.scope;
        layer.bindPopup(_this._markerPopupTemplate(feature.properties));
      },

      pointToLayer: function (feature, latlng) {
        var alertColor = null;
        _.each(feature.properties.lastdata,function(l) {
          var metaData = App.Utils.toDeepJSON(App.mv().getVariable(l.var));
          var thresholds = metaData.var_thresholds;
          if(l.value){
            if(!metaData.reverse){
              if(l.value >= thresholds[2] && thresholds[2]){
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.ERROR);
              }else if(!alertColor && l.value >= thresholds[1] && thresholds[1]){
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.WARNING);
              }
            }else{
              if(l.value <= thresholds[1] && thresholds[1]){
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.ERROR);
              }else if(!alertColor && l.value <= thresholds[2] && thresholds[2]){
                alertColor = App.Utils.rangeColor(App.Utils.RANGES.WARNING);
              }
            }
          }
        });
        if(alertColor){
          var alertOptions = {
            radius: 12,
            weight: 0,
            fillOpacity: 0,
            color:alertColor,
            className:'alert_map'
          };
          var markerAlert = L.circleMarker(latlng, alertOptions);
          _this._alertGroup[model.get('id')].addLayer(markerAlert);
        }

        return L.marker(latlng, {icon: icon})
      },

      filter: function(feature,layer){
        if (feature.properties.entity_id != model.get('id'))
          return false;

        totals.all++;

        var filter = fn ? fn(feature.properties) : true;

        // if (true || filter) // counters only show bbox changes
        //   totals.filter++;

        if (_this._ctx.get('bbox')){
          var coord = feature.geometry.coordinates;
          if (bounds.contains([coord[1],coord[0]])){
            totals.filter++;
          }
        }
        else{
          totals.filter++;
        }

        return filter;
      }
    };


    var geojson = L.geoJson(data,opts);
    this._layerGroups[model.get('id')] = geojson;

    if (model.get('enable'))
      geojson.addTo(this.map);

    model.set('totals',totals);
  }

});
