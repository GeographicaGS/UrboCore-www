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

App.View.MapSearch = Backbone.View.extend({

  _template: _.template($('#map-search_template').html()),
  _template_list: _.template($('#map-search_template_list').html()),

  initialize: function (options) {

    this.options = _.defaults(options || {}, {
      placeholderInput: __('buscar sensor, emplazamiento...'),
      historic: false, // To search by dates
    });

    _.bindAll(this, '_updateTerm');

    this._map = this.options.map;
    this._collection = this.options.collection;
    this.listenTo(this._collection, 'reset', this._collectionReset);

    var icon = L.icon({
      iconUrl: '/img/SC_marcador_busqueda.svg',
      iconSize: [50, 50],
      iconAnchor: [25, 50]
    });

    this._markerS = L.marker([0, 0], { 'clickable': false, 'opacity': 0, zIndexOffset: '999', 'icon': icon }).addTo(this._map);
    this.render();
  },

  events: {
    'keyup input[type=text]': '_updateTerm',
    'click li': '_selectTerm',
    'click img': '_clearSearch'
  },

  render: function () {
    this.$el.html(this._template({
      placeholderInput: this.options.placeholderInput
    }));

    return this;
  },

  toggleView: function () {
    this.$('#search_map').toggleClass('hide');
  },

  _updateTerm: _.debounce(function (e) {
    // set some options
    this._collection.options.term = $(e.currentTarget).val();

    if (this.options.historic) {
      this._collection.options.time = {
        start: App.ctx.getDateRange().start,
        finish: App.ctx.getDateRange().finish
      }
    }

    if (this._collection.options.term.length) {
      this._collection.fetch({
        reset: true
      });

      this.$('#search_map').addClass('searching');
      this.$('.loading').remove();
      this.$('#search_map').append(App.circleLoading());
    } else {
      this.$('img').trigger('click');
    }
  }, 500),

  _collectionReset: function () {
    this.$('.loading').remove();

    if (this._collection.toJSON().length > 0
      && this._collection.options.term.length) {
      this.$('ul').addClass('active');
      this.$('ul').html(this._template_list({
        elements: this._collection.toJSON() 
      }));
    } else {
      this.$('ul').removeClass('active');
    }
  },

  _selectTerm: function (e) {
    this.$('#search_map').addClass('searching');
    this.$('input[type=text]').val($(e.currentTarget).text());
    this.$('ul').removeClass('active');
    var elem = this._collection.findWhere({ 'element_id': $(e.currentTarget).attr('element_id') });
    var bbox = elem.get('bbox');
    var maxZoom = 18;
    if (elem.get('type') == 'device') {
      maxZoom = 19;
      this._markerS.setLatLng([bbox[1], bbox[0]])
    } else {
      this._markerS.setLatLng([(bbox[3] + bbox[1]) / 2, (bbox[2] + bbox[0]) / 2])
    }
    this._markerS.setOpacity(1);
    this._map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], { 'maxZoom': maxZoom });
  },

  _clearSearch: function () {
    this.$('ul').removeClass('active');
    this.$('.loading').remove();
    this.$('input[type=text]').val('');
    this.$('#search_map').removeClass('searching');
    this._markerS.setOpacity(0);
  },

  onClose: function () {
    this.stopListening();
  },

});
