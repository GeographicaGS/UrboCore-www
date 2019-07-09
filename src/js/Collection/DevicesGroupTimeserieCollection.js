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

App.Collection.DevicesGroupTimeserie = Backbone.Collection.extend({
  initialize: function (models, options) {
    this.options = options;
  },

  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/variables/' + this.options.variable + '/devices_group_timeserie'
  },

  parse: function (response) {

    var aux = {};

    _.each(response, function (r) {
      _.each(Object.keys(r.data), function (k) {
        if (!aux[k])
          aux[k] = [];
        if (r.data[k] != null)
          aux[k].push({
            x: moment.utc(r.time).toDate(),
            y: k == 'seconds'
              ? r.data[k] / 60
              : r.data[k]
          });
      });
    });

    response = _.map(aux, function (values, key) {
      return { 'key': key, 'values': values, 'disabled': false }
    });

    return response;
  },

  fetch: function (options) {

    options = options || {};

    var date = App.ctx.getDateRange();
    options['data'] = {
      'start': date.start,
      'finish': date.finish,
      'id_variable': this.options.variable,
      'step': this.options.step,
      'agg': this.options.agg,
      'groupagg': true
    };

    if (App.ctx.get('bbox'))
      options['data']['bbox'] = App.ctx.get('bbox');

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
