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

App.View.WidgetDeviceMap = App.View.Widgets.Base.extend({

	_template: _.template( $('#widgets-widget_device_map_template').html() ),

  initialize: function(options) {

    /* IMPROVE: Create a Base Model with defaults values */
    if (!this.model.get('link'))
      this.model.set('link','/' + this.model.get('scope') + '/' + this.model.get('section') + '/map');

    if (!this.model.get('title'))
      this.model.set('title',__('Mapa de dispositivos'));

    if (!this.model.get('titleLink'))
      this.model.set('titleLink',null);

    this.deviceCollection = new App.Collection.DevicesMapRaw(null,{scope: this.model.get('scope')});
    this.listenTo(this.deviceCollection,'reset',this._draw_markers);
    this.deviceCollection.fetch({'reset': true,data: { 'entities': this.model.get('entities').join(',')}});

    this.render();

  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
  	this.setElement(this._template(this.model.toJSON()));

		if(this.model.get("realTimeComponent") != undefined) {
      var model = new Backbone.Model({
        botonLocationView:this.$(".botons"),
        tooltipIcon: __('Ahora')
      });
      this._renderRealTimeComponent(model);
    }

    return this;
  },

  _draw_markers:function(){
    var _this = this;
    this.map = new L.Map(this.$('.map')[0], {
      zoomControl : false,
      doubleClickZoom:false,
      dragging:false
    });

    // new L.Control.Zoom({ position: 'bottomright' }).addTo(this.map);

    // L.tileLayer('https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/reduced.day/{z}/{x}/{y}/256/png8?lg=es&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24', {
    // }).addTo(this.map);

L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
    }).addTo(this.map);

    this.map.setView(this.model.get('location'), this.model.get('zoom'));

    this.$('.leaflet-control-attribution').detach().appendTo('.leaflet-bottom.leaflet-left')

    var circleOptions = {
        radius: 4,
        weight: 0,
        fillOpacity: 1,
        clickable:false,
        color: this.model.get('color')
    };
    _.each(this.deviceCollection.toJSON(),function(d){
      L.circleMarker(d.location, circleOptions).addTo(_this.map);
    });

    this.$('.widget_loading').remove();
  }

});
