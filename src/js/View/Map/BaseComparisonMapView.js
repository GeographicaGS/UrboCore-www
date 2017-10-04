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

App.View.Map.BaseComparison = Backbone.View.extend({

  _layerGroups : {},

  initialize: function(options) {
    this.layers = options.layers;
    this.options = options;
    this.legendData = this.options.legendData || undefined;

    _.bindAll(this,'_onMapMoved');

    this._mapInstances = [];

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:bbox',this.changeBBOX);
    this.listenTo(this._ctx,'change:bbox_status',this._changeBBOXStatus);
    this.listenTo(this._ctx,'change:start change:finish',this.changeDate);

  },

  _getMapOptions: function() {
    return {
      zoomControl : false,
      minZoom : 2,
      maxZoom : 100,
      scrollWheelZoom: false
    };
  },

  _getTileLayer: function() {
    return L.tileLayer('https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/reduced.day/{z}/{x}/{y}/256/png8?lg=es&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24', {
    });
  },

  onClose: function(){
    this.stopListening();
    _.each(this._mapInstances, function(map) {
      map.remove();
    });
    App.ctx.set('bbox',null);
  },

  render: function(){
    this.$el.append(App.mapLoading());

    if (this.options.type == 'multiple'){
      this._createMultipleMap();
    }
    else{
      this._createSingleMap();
    }

    return this;
  },

  _createSingleMap: function() {

    if (this._currentMapType=='comparison'){
      for (var i=0;i<this._mapInstances.length;i++){
        this._mapInstances[i].remove();
      }
    }

    this.$el
      .html("<div class='map single'></class>");

    this.map = new L.Map(this.$('.map')[0], this._getMapOptions());
    this._mapInstances = [this.map];

    new L.Control.Zoom({ position: 'topright' }).addTo(this._mapInstances[0]);

    this._getTileLayer().addTo(this.map);

    this._mapInstances[0].setView(this.options.center, this.options.zoom);
    this._mapInstances[0].on('moveend',this._onMapMoved);
    var _this = this;
    setTimeout(function(){
       _this._mapInstances[0].invalidateSize();
    },1000);
    this._currentMapType = 'single';

    //Leyenda
    if(this.legendData != undefined) {
      var legendMapView = new App.View.Map.ComparisonLegend({'rampColor':this.legendData.rampFirstMap, variable:this.options.variableLeft});
      this.$el.append(legendMapView.render().$el);
    }
  },

  _createMultipleMap: function() {

    if (this._currentMapType=='single'){
      this._mapInstances[0].remove();
      this.map = null;
    }

    this.$el
      .html("<div id=\'map1\'></div><div id=\'map2\'></div>");

    this._mapInstances[0] = new L.Map('map1', this._getMapOptions());
    this._mapInstances[1] = new L.Map('map2', this._getMapOptions());

    this._mapInstances[0].setView(this.options.center, this.options.zoom);
    this._mapInstances[1].setView(this.options.center, this.options.zoom);

    this._mapInstances[0].sync(this._mapInstances[1]);
    this._mapInstances[1].sync(this._mapInstances[0]);

    new L.Control.Zoom({ position: 'topright' }).addTo(this._mapInstances[0]);
    new L.Control.Zoom({ position: 'topright' }).addTo(this._mapInstances[1]);

    this._getTileLayer().addTo(this._mapInstances[0]);
    this._getTileLayer().addTo(this._mapInstances[1]);

    this._mapInstances[0].on('moveend',this._onMapMoved);
    this._mapInstances[1].on('moveend',this._onMapMoved);
    var _this = this;
    setTimeout(function(){
       _this._mapInstances[0].invalidateSize();
    },1000);
    setTimeout(function(){
       _this._mapInstances[1].invalidateSize();
    },1000);
    this._currentMapType = 'comparison';

    //Leyenda
    if(this.legendData != undefined) {
      var legendMapViewFirst = new App.View.Map.ComparisonLegend({rampColor:this.legendData.rampFirstMap, variable:this.options.variableLeft});
      this.$el.append(legendMapViewFirst.render().$el);
      var legendMapViewSecond = new App.View.Map.ComparisonLegend({rampColor:this.legendData.rampSecondMap, variable:this.options.variableRight});
      this.$el.append(legendMapViewSecond.render().$el);
      $(this.$('.choropleth')[1]).addClass("second");
    }
  },

  filtersLayer: function(m){
    console.error('Virtual method call not supported [filtersLayer]');
  },

  changeBBOX: function(){
    console.error('Virtual method call not supported [changeBBOX]');
  },

  toggleLayer: function(m){
    console.error('Virtual method call not supported [toggleLayer]');
  },

  changeDate: function(){
    console.error('Virtual method call not supported [changeDate]');
  },

  _getCurrentBBOX: function(){
    return this.map.getBounds().toBBoxString().split(',');
  },

  _onMapMoved: function(){
    if (this._ctx.get('bbox_status'))
      this._ctx.set('bbox',this._getCurrentBBOX());
  },

  _changeBBOXStatus: function(){
    if (this._ctx.get('bbox_status'))
      this._ctx.set('bbox',this._getCurrentBBOX());
    else
      this._ctx.set('bbox',null);
  },

  _onNamedMapCreated: function(layer){
    this.$('.loading.map').addClass('hiden');
  },

});
