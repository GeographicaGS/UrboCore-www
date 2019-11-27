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

App.View.Map.Deprecated.Base = Backbone.View.extend({

  _popupTemplate: _.template($('#map-entity_popup_template').html()),

  _layerGroups: {},

  initialize: function (options) {

    this.options = options;

    _.bindAll(this, '_onMapMoved', '_onNamedMapCreated');

    this._ctx = App.ctx;
    this.listenTo(this._ctx, 'change:bbox', this.changeBBOX);
    this.listenTo(this._ctx, 'change:bbox_status', this._changeBBOXStatus);
    this.listenTo(this._ctx, 'change:start change:finish', this.changeDate);

    if (options.filterModel) {
      this.filterModel = options.filterModel;
      this.listenTo(this.filterModel, 'change', this.applyFilters);
    }
  },

  onClose: function () {

    this.stopListening();

    if (this.map)
      this.map.remove();

    App.ctx.set('bbox', null);

  },

  render: function () {

    this.$el.append(App.mapLoading());

    this.map = new L.Map(this.$el[0], {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 19,
      scrollWheelZoom: false
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(this.map);

    this.map.setView(this.options.center, this.options.zoom);

    this.map.on('moveend', this._onMapMoved);

    // popup events
    this.map.on('popupopen', this._onClickedPopupOpen);
    this.map.on('popupclose', this._onClickedPopupClose);

    setTimeout(function () {
      this.resetSize();
    }.bind(this), 100);

    return this;
  },

  resetSize: function () {
    this.map.invalidateSize();
  },

  changeBBOX: function () {
    console.error('Virtual method call not supported [changeBBOX]');
  },

  changeDate: function () {
    console.error('Virtual method call not supported [changeDate]');
  },

  applyFilters: function () {
    console.error('Virtual method call not supported [applyFilters]');
  },

  _getCurrentBBOX: function () {
    return this.map.getBounds().toBBoxString().split(',');
  },

  _onMapMoved: function () {
    if (this._ctx.get('bbox_status'))
      this._ctx.set('bbox', this._getCurrentBBOX());
  },

  _changeBBOXStatus: function () {
    if (this._ctx.get('bbox_status'))
      this._ctx.set('bbox', this._getCurrentBBOX());
    else
      this._ctx.set('bbox', null);
  },

  _onNamedMapCreated: function (layer) {
    //var _this = this;
    this.$('.loading.map').addClass('hiden');
    // layer.on('loading', function() {
    //   _this.$('.loading.map').removeClass('hiden');
    // });

    // layer.on('load', function() {
    //   _this.$('.loading.map').addClass('hiden');
    // });
  },
  _clickFN: function (dataFN) {
    var _this = this;
    return function (e, pos, pixel, data) {
      if (!_this._popup) _this._popup = L.popup();

      _this._popup
        .setLatLng(pos)
        .setContent(_this._popupTemplate(dataFN(data)))
        .openOn(_this.map);
    }
  },

  clickableLayer: function (layer, dataFN) {

    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(0).on('featureClick', this._clickFN(dataFN));
    //
    var hovers = [], _this = this;
    layer.bind('featureOver', function (e, latlon, pxPos, data, layer) {
      hovers[layer] = 1;
      if (_.any(hovers)) {
        _this.$el.css('cursor', 'pointer');
      }
    });
    layer.bind('featureOut', function (m, layer) {
      hovers[layer] = 0;
      if (!_.any(hovers)) {
        _this.$el.css('cursor', 'auto');
      }
    });
  },

  /**
   * When we open a popup
   * 
   * @param {*} e - event triggered
   */
  _onClickedPopupOpen: function (e) {
    // Set status tooltip
    App.ctx.set('mapTooltipIsShow', true);
  },
  /**
   * When we close a popup
   * 
   * @param {*} e - event triggered
   */
  _onClickedPopupClose: function (e) {
    // Set status tooltip
    App.ctx.set('mapTooltipIsShow', false);
  },
});

App.View.Map.LayerMap = App.View.Map.Deprecated.Base.extend({
  initialize: function (options) {
    this.layers = options.layers || [];
    App.View.Map.Deprecated.Base.prototype.initialize.call(this, options);
  },
  /* Only used for old maps. */
  toggleLayer: function (m) {
    console.error('Virtual method call not supported [toggleLayer]');
  },
  /* Only used for old maps. */
  filtersLayer: function (m) {
    console.error('Virtual method call not supported [filtersLayer]');
  },

  render: function () {
    App.View.Map.Deprecated.Base.prototype.render.call(this);

    for (var i = 0; i < this.layers.length; i++) {
      this.listenTo(this.layers.at(i), 'change:enable', this.toggleLayer);
      this.listenTo(this.layers.at(i), 'change:filters', this.filtersLayer);
    }
  }
});
