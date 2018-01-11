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

App.View.Map.Base = Backbone.View.extend({
  _popupTemplate: _.template( $('#map-entity_popup_template').html()),
  clickTemplate: _.template( $('#map-click_carto_template').html()),
  hoverTemplate: _.template( $('#map-hover_template').html()),

  _layerGroups : {},

  initialize: function(options) {

    this.options = _.extend({
      center: [0,0],
      zoom: 16,
      timeMode: 'historic'
    },options);


    this.mapHovers = [];

    _.bindAll(this,'_onMapMoved', '_onNamedMapCreated', '_onFeatureClick', '_onFeatureOver', '_onFeatureOut','_onClickedPopupOpen', '_onClickedPopupClose');

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:bbox',this.changeBBOX);
    this.listenTo(this._ctx,'change:bbox_status',this._changeBBOXStatus);
    if(this.options.timeMode === 'historic'){
      this.listenTo(this._ctx,'change:start change:finish',this.changeDate);
    }

    if (options.filterModel){
      this.filterModel = options.filterModel;
      this.listenTo(this.filterModel,'change',this.applyFilters);
    }

    this._username = App.Utils.getCartoAccount(this.options.id_category);

  },

  onClose: function(){

    this.stopListening();

    if (this.map)
      this.map.remove();

    App.ctx.set('bbox',null);

  },

  render: function () {
    this.$el.append(App.mapLoading());

    this.map = new L.Map(this.$el[0], {
      zoomControl : false,
      minZoom : 2,
      maxZoom : 100,
      scrollWheelZoom: false
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    // L.tileLayer('https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/reduced.day/{z}/{x}/{y}/256/png8?lg=es&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24', {
    // }).addTo(this.map);

    this._baseMap = L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
      minZoom: 0,
      maxZoom: 15
    }).addTo(this.map);

    this._baseMap = L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      minZoom: 15,
      maxZoom: 20
    }).addTo(this.map);

    this.map.setView(this.options.center, this.options.zoom);
    var _this = this;
    this.map.on('moveend', this._onMapMoved);

    // Custom Layers for named map
    if(this.options.slug){
      try {
        var layers = App.mv().getCategory(this.options.id_category).toJSON().config.maps[this.options.slug];
        layers.forEach(function(layer) {
          _this._createCartoLayer(layer);
        });


      } catch(e) {
        console.log(e.stack);
      }

    }


    setTimeout(function () {
       _this.map.invalidateSize();
    }, 100);

    this.legendView = new App.View.Map.LegendBase(this.options);
    this.$el.append(this.legendView.render().$el);

    return this;
  },

  changeBBOX: function () {
    console.error('Virtual method call not supported [changeBBOX]');
  },

  changeDate: function () {
    if (this.layer)
      this.layer.setParams(this._ctx.getDateRange());
  },

  applyFilters: function () {
    console.error('Virtual method call not supported [applyFilters]');
  },

  resetSize: function() {
    this.map.invalidateSize();
  },

  _getCurrentBBOX: function () {
    return this.map.getBounds().toBBoxString().split(',');
  },

  _onMapMoved: function () {
    if (this._ctx && this._ctx.get('bbox_status'))
      this._ctx.set('bbox',this._getCurrentBBOX());
  },

  _changeBBOXStatus: function () {
    if (this._ctx && this._ctx.get('bbox_status'))
      this._ctx.set('bbox', this._getCurrentBBOX());
    else if (this._ctx)
      this._ctx.set('bbox', null);
  },

  _onNamedMapCreated: function (layer) {
    this.layer = layer;

    if (!this._popup) this._popup = L.popup();
    if (!this._popupHover) this._popupHover = L.popup({
      className: 'hoverPopup',
      closeButton: false
    });

    this.map.on('popupopen', this._onClickedPopupOpen);
    this.map.on('popupclose', this._onClickedPopupClose);

    this.$('.loading.map').addClass('hiden');

    var opts = {scope: this.options.scope};
    if (this.options.timeMode === 'historic')
      opts = _.extend(opts, this._ctx.getDateRange());

    if (layer && layer.setParams)
      layer.setParams(opts);
  },

  _clickFN: function (dataFN) {
    var _this = this;
    return function (e, pos, pixel, data) {
      if (!_this._popup) _this._popup = L.popup();
      _this._popup
        .setLatLng(pos)
        .setContent(_this._popupTemplate(dataFN(data)))
        .openOn(_this.map);
    };
  },

  clickableLayer: function (layer, dataFN) {
    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(0).on('featureClick', this._clickFN(dataFN));
    this.setLayerCursor(layer);
  },

  setLayerCursor: function(layer){
    //
    var _this = this;
    layer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
      _this.mapHovers[layer] = 1;
      if(_.any(_this.mapHovers)) {
        _this.$el.css('cursor', 'pointer');
      }
    });
    layer.bind('featureOut', function(m, layer) {
      _this.mapHovers[layer] = 0;
      if(!_.any(_this.mapHovers)) {
        _this.$el.css('cursor', 'auto');
      }
    });
  },

  _onFeatureClick: function(e, pos, pixel, data, sublayer, extraParam) {

    this._id_parking = data.id_entity || null;
    this._clickpos = pos;

    this._popup
      .setLatLng(pos)
      .setContent(this._clickFeatureContent(e, pos, pixel, data, sublayer, extraParam))
      .openOn(this.map);

    // $('.parking_selector .label').text(data.name);
  },

  _onFeatureOver: function(e, pos, pixel, data, sublayer) {
    if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
      this._popupHover
        .setLatLng(pos)
        .setContent(this._hoverFeatureContent(e, pos, pixel, data, sublayer))
        .openOn(this.map);
    }else if(this.map.hasLayer(this._popupHover)){
      this._popupHover
        .setLatLng(pos)
        .setContent(this._hoverFeatureContent(e, pos, pixel, data, sublayer))
        .update();
    }
  },

  _onFeatureOut: function(e, pos, pixel, data) {
    if(!this._clickedPopup)
      this.map.closePopup();
  },

  _onClickedPopupOpen: function(e){
    if(e.popup.options.className !== 'hoverPopup')
      this._clickedPopup = true;
  },

  _onClickedPopupClose: function(e){
    if(e.popup.options.className !== 'hoverPopup')
      this._clickedPopup = false;
  },

  _hoverFeatureContent: function(e, pos, pixel, data, sublayer){
    console.error('Virtual method call not supported [_hoverFeatureContent]');
  },

  _clickFeatureContent: function(e, pos, pixel, data, sublayer, extraParam){
    console.error('Virtual method call not supported [_clickFeatureContent]');
  },

  redraw: function(timeout){
    var _this = this;
    setTimeout(function(){
      _this.map.closePopup();
      _this.map.eachLayer(function(layer){
        try {
          layer.invalidate();
        } catch(e) {}
      })
    }, timeout || 20000);
  },

  _createCartoLayer(layer){
    var sql = layer.sql;
    var cartocss = layer.cartocss;
    var interactivity = layer.interactivity.map(field => {
      return field.field;
    });

    var cartotype = layer.cartotype || 'cartodb';
    var sqlKey = (cartotype==='cartodb') ? 'sql': 'query';


    var subLayer = [];
    subLayer[sqlKey] = sql;
    subLayer.cartocss = cartocss;
    subLayer.interactivity = interactivity;

    var options = {
      type: cartotype,
      user_name: this._username,
      sublayers: [ subLayer ]
    }

    var _this = this;
    cartodb.createLayer(
      this.map,
      options,
      {https: true}
    ).addTo(this.map)
    .done((function(l){

      var sublayer = l.getSubLayer(0);
      this.setLayerCursor(sublayer);
      sublayer.setInteraction(true);

      sublayer.on('featureClick', (e, pos, pixel, o, layerIndex)  => {

        e.preventDefault();

        var header = layer.interactivity.filter( el => {
          return el.header
        })[0];

        var content = layer.interactivity.filter( el => {
          return el.title;
        }).map( el => {
          return { "title": el.title, "value": o[el.field] }
        });

        this._popup = this._popup || L.popup();
        this._popup
          .setLatLng(pos)
          .setContent(this.clickTemplate({data: { data: content, title: header.header, subtitle: o[header.field] }}))
          .openOn(this.map);


      });




    }).bind(this));

  }





});
