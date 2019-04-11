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

/**
 * A view to show a devices list to choose next the device name into
 * the device view
 */
App.View.DeviceList = Backbone.View.extend({
  _template: _.template($('#devices-device_list_template').html()),

  initialize: function (options) {
    // model and options
    this.model = options.model;
    if (options.template) {
      this._template = options.template;
    }

    // Collection with the data to show
    this._collection = new Backbone.Collection();
    this._collection.url = App.config.api_url + '/' + this.model.get('scope') + '/entities/' + this.model.get('entity') + '/elements';
    this.listenTo(this._collection, 'reset', this.render);
    this._collection.fetch({ 'reset': true });
  },

  onClose: function () {
    this.stopListening();
  },

  render: function () {
    this.$el.html(this._template({
      elements: this._collection.toJSON(),
      m: this.model.toJSON() 
    }));

    return this;
  }

});
