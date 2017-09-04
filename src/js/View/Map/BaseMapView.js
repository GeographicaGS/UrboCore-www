'use strict';

App.View.Map.Base = Backbone.View.extend({
  _popupTemplate: _.template( $('#map-entity_popup_template').html()),
  clickTemplate: _.template( $('#map-click_template').html()),
  hoverTemplate: _.template( $('#map-hover_template').html()),

  _layerGroups : {},

  initialize: function(options) {

    this.options = _.extend({
      center: [0,0],
      zoom: 16,
      timeMode: 'historic'
    },options);

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

    this.map.on('moveend', this._onMapMoved);

    var _this = this;
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
    var hovers = [], _this = this;
    layer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
      hovers[layer] = 1;
      if(_.any(hovers)) {
        _this.$el.css('cursor', 'pointer');
      }
    });
    layer.bind('featureOut', function(m, layer) {
      hovers[layer] = 0;
      if(!_.any(hovers)) {
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
    this.$el.css('cursor', 'pointer');
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
    this.$el.css('cursor', 'auto');
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
  }


});
