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

App.View.MapBoxSearch = App.View.MapSearch.extend({

  initialize: function (options) {

    this.options = _.defaults(options || {}, {
      placeholderInput: __('buscar sensor, emplazamiento...')
    });

    if (this.options.template) {
      this._template = _.template(this.options.template);
    }

    if (this.options.template_list) {
      this._template_list = _.template(this.options.template_list);
    }

    this._map = this.options.map;
    this._collection = this.options.collection;

    this._marker = new mapboxgl.Marker({ color: '#003146' })

    this.listenTo(this._collection, "reset", this._collectionReset);

  },

  _selectTerm: function (e) {
    this.$('#search_map').addClass('searching');
    this.$('input[type=text]').val('');
    this.$('ul').removeClass('active');
    var elem = this._collection.findWhere({ 'element_id': $(e.currentTarget).attr('element_id') });
    var bbox = elem.get('bbox');
    var maxZoom = 18;
    if (elem.get('type') == 'device') {
      maxZoom = 19;
    }

    this._marker.setLngLat([bbox[0], bbox[1]])
      .addTo(this._map);

    this._map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { maxZoom: maxZoom });
  },

  _clearSearch: function () {
    this.$('ul').removeClass('active');
    this.$('.loading').remove();
    this.$('input[type=text]').val('');
    this.$('#search_map').removeClass('searching');

    this._marker.remove()
  }

});
