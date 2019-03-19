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

  _template: _.template($('#widgets-widget_device_map_template').html()),

  initialize: function (options) {
    this.setDefaultValues();
    this.getDataCollection();
    this.render();
  },

  /**
   * Set default values into the model
   */
  setDefaultValues: function() {
    // Default values
    var defaultValues = {
      link: '/' + this.model.get('scope') + '/' + this.model.get('section') + '/map',
      title: __('Mapa de dispositivos'),
      titleLink: null
    };

    _.each(defaultValues, function(value, index) {
      if (!this.model.get(index)) {
        this.model.set(index, value);
      }
    }.bind(this));
  },

  /**
   * Get data collection from remote server
   */
  getDataCollection: function() {
    this.deviceCollection = new App.Collection.DevicesMapRaw([], { scope: this.model.get('scope') });

    this.deviceCollection.fetch({
      reset: true, 
      data: { 
        entities: this.model.get('entities').join(',')
      }
    });

    // event triggered to draw the markers
    this.listenTo(this.deviceCollection, 'reset', this.drawMarkers);
  },

  render: function () {
    // Draw in the DOM the template with the differents params
    this.setElement(this._template(this.model.toJSON()));

    if (this.model.get('realTimeComponent') !== undefined) {
      this._renderRealTimeComponent(new Backbone.Model({
        botonLocationView: this.$el.find('.botons'),
        tooltipIcon: __('Ahora')
      }));
    }

    return this;
  },

  /**
   * Draw the markers into the map, only the position
   * 
   * The map will be drawed is based in the library "leafletjs.com"
   */
  drawMarkers: function () {
    this.map = new L.Map(this.$el.find('.map')[0], {
      zoomControl: false,
      doubleClickZoom: false,
      dragging: false
    });

    L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {})
      .addTo(this.map);

    // Set different options to the map
    this.map.setView(this.model.get('location'), this.model.get('zoom'));

    // Move link the 'leaflet' to the left
    this.$el.find('.leaflet-control-attribution')
      .detach()
      .appendTo('.leaflet-bottom.leaflet-left');

    // Draw the different circles into the map
    var circleOptions = {
      radius: 4,
      weight: 0,
      fillOpacity: 1,
      clickable: false
    };
    var defaultColor = '#999';

    _.each(this.deviceCollection.toJSON(), function (data) {
      var currentColor = this.model.get('color');

      // each color with a different color
      if (typeof currentColor === 'string') {
        circleOptions.color = currentColor;
      } else if(typeof currentColor === 'object') {
        var currentEntity = data.id.toLowerCase().split(':').shift();
        circleOptions.color = currentEntity && currentColor[currentEntity] 
          ? currentColor[currentEntity].colour
          : defaultColor;
      } else {
        circleOptions.color = defaultColor;
      }

      L.circleMarker(data.location, circleOptions)
        .addTo(this.map);
    }.bind(this));

    // Remove loading
    this.$el.find('.widget_loading').remove();
  },

  /**
   * Close widget (remove) and delete any event
   */
  onClose: function () {
    this.stopListening();
  },

});
