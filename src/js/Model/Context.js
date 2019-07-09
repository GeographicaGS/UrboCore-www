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

App.Model.Context = Backbone.Model.extend({

  // Defaults data in model
  defaults: {
    start: false,
    finish: false,
    bbox_info: true,
    bbox_status: false,
    bbox: null
  },

  initialize: function (attributes, options) {

    Backbone.Model.prototype.initialize.call(this, [attributes, options]);

    // Check if is local (not global) to avoid loading default dates and check if start or finish dates are set
    if (!(attributes && attributes.local || attributes && attributes.start && attributes.finish)) {
      var data;
      try {
        data = JSON.parse(localStorage.getItem('context')) || {};

        if (data.start) {
          data.start = moment.utc(data.start);
        } else {
          data.start = moment().subtract(7, 'days').utc();
        }

        if (data.finish) {
          data.finish = moment.utc(data.finish);
        } else {
          data.finish = moment().utc();
        }
      } catch (err) {
        data = {};
      }

      if (data) {
        this.set(data);
      }
    }

    // Check if is local (not global) to avoid saving changes as default dates
    if (!(attributes && attributes.local)) {
      this.on('change', this._save);
    }
  },

  /**
   * Save the context in "localStorage"
   */
  _save: function () {
    localStorage.setItem('context', JSON.stringify(this.toJSON()));
  },

  /**
   * Get dates from "context"
   *
   * @return {Array | NULL} - bbox data from the map is showed
   */
  getBBOX: function () {
    return this.get('bbox_status') ? this.get('bbox') : null;
  },

  /**
   * Get dates from "context"
   *
   * @return {Object | FALSE} - data from the date widget
   */
  getDateRange: function () {
    try {
      return {
        start: moment(this.get('start')).toISOString(),
        finish: moment(moment.utc(this.get('finish')).toDate())
          .endOf('day').toISOString()
      }
    } catch (err) {
      return false;
    }
  }

});
