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

    this.listenTo(this.options.filterModel, 'change:currentStatus', function(){
      this._marker.remove()
      if (this.$('input').val().length > 0){
        this._updateTerm()
      }
    })

  },

  _selectTerm: function (e) {
    this.$('#search_map').addClass('searching');
    this.$('input[type=text]').val('');
    this.$('ul').removeClass('active');
    var elem = this._collection.findWhere({ 'id_entity': $(e.currentTarget).attr('element_id') });
    var bbox = elem.get('geometry');
    var maxZoom = 18;
    if (elem.get('type') == 'device') {
      maxZoom = 19;
    }

    this._marker.setLngLat([bbox[0], bbox[1]])
      .addTo(this._map);

    this._map.fitBounds([[bbox[0], bbox[1]], [bbox[0], bbox[1]]], { maxZoom: maxZoom });
  },

  _updateTerm: _.debounce(function (e) {
    var term = e 
    ? $(e.currentTarget).val()
    : this.$('input').val();
    this._collection.options.term = term
    this._collection.fetch({ 
      'reset': true,
      data: this.getCurrentFilterParams(term) || {}});
    if (this._collection.options.term.length > 0) {
      this.$('#search_map').addClass('searching');
      this.$('.loading').remove();
      this.$('#search_map').append(App.circleLoading());
    } else {
      this.$('img').trigger('click');
    }
  }, 500),

  // This function is meant to be overrided on each vertical since
  // filtering requires special data treatment
  getCurrentFilterParams(){
    return null
  },

  _clearSearch: function () {
    this.$('ul').removeClass('active');
    this.$('.loading').remove();
    this.$('input[type=text]').val('');
    this.$('#search_map').removeClass('searching');

    this._marker.remove()
  },

});
