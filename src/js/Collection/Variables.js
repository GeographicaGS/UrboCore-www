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

App.Collection.Variables.Timeserie = App.Collection.Post.extend({
  initialize: function (models, options) {

    this.options = options;

    // This is a "caos" each collection receives
    // the "options" in too many different ways,
    // I put this condition to avoid this problem
    if (!this.options.data) {
      var date = App.ctx.getDateRange();

      if (this.options.date && this.options.date.start) {
        date = this.options.date
      }

      this.options.data = {
        agg: this.options.agg,
        csv: this.options.csv || false,
        filters: this.options.filters || {},
        findTimes: this.options.findTimes || false,
        noData: this.options.noData || false,
        time: {
          start: date.start,
          finish: date.finish,
          step: this.options.step
        },
        vars: this.options.vars,
      };
    }

  },

  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/variables/timeserie'
  },

  parse: function (response) {

    if (typeof response === 'object') {

      var aux = {};
      response = response.sort(function (t1, t2) {
        return moment(t1.time).isBefore(moment(t2.time)) ? -1 : 1;
      });
      _.each(response, function (r) {
        _.each(Object.keys(r.data), function (k) {
          if (!aux[k]) {
            aux[k] = [];
          }
          aux[k].push({
            x: isNaN(r.time) ? new Date(r.time) : r.time,
            y: r.data[k] !== null ? k == 'seconds' ? r.data[k] / 60 : r.data[k] : null
          });
        });
      });

      response = _.map(aux, function (values, key) {
        return { 'key': key, 'values': values, 'disabled': false }
      });

    }

    return response;
  },

  setTimeRange: function (start, finish) {
    this.options.data.time.start = start;
    this.options.data.time.finish = finish;
  },

  setStep: function (step) {
    this.options.data.time.step = step;
  }
});

App.Collection.Variables.TimeserieGrouped = App.Collection.Post.extend({
  initialize: function (models, options) {
    this.options = options;

    this.options.data = {
      agg: this.options.agg,
      vars: this.options.vars,
      csv: this.options.csv || false,
      time: {
        start: this.options.start,
        finish: this.options.finish,
        step: this.options.step
      },
      filters: this.options.filters || {}
    };
  },

  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/variables/timeserie'
  },

  parse: function (response) {
    var aux = {};
    _.each(response, function (r) {
      _.each(r.data, function (data) {
        _.each(data, function (d) {
          if (!aux[d.agg]) {
            aux[d.agg] = [];
          }
          aux[d.agg].push({
            x: moment.utc(r.time).toDate(),
            y: d.value
          });
        });
      });
    });
    response = _.map(aux, function (values, key) {
      return { 'key': key, 'values': values, 'disabled': false }
    });
    return response;
  }
});

App.Collection.Variables.DailyAgg = App.Collection.Post.extend({
  initialize: function (models, options) {
    this.options = _.defaults(options, { data: {} });
    var date = App.ctx.getDateRange();
    this.options.data = _.defaults(options.data, {
      agg: 'AVG',
      findTimes: false,
      time: {
        start: date.start,
        finish: date.finish,
        step: '1h'
      },
      filters: {},
      startOnMidnight: false
    });

  },

  url: function () {
    return App.config.api_url + '/' + this.options.id_scope + '/variables/dailyagg';
  },

  setTimeRange: function (start, finish) {

    this.options.data.time.start = start;
    this.options.data.time.finish = finish;
  },

  parse: function (response) {
    var aux = {};
    var _this = this;

    // We modify the "back" response, it depends
    // the "start" date from request
    var hourStart = moment(App.ctx.getDateRange().start).utc().hour();
    var firstPartResponse = response.slice(hourStart) || [];
    var secondPartResponse = response.slice(0, hourStart) || [];
    var currentTime = 0; // seconds
    
    // change the order of array response
    // and new value to time
    response = firstPartResponse.concat(secondPartResponse);
    response = _.map(response, function (item) {
      item.time = currentTime;
      currentTime += 3600;
      return item;
    });

    _.each(response, function (r) {
      _.each(Object.keys(r.data), function (k) {
        if (!aux[k])
          aux[k] = [];
        var x;
        if (isNaN(r.time)) {
          x = new Date(r.time);
        } else if (!_this.options.startOnMidnight) {
          if (r.time < 43200) {
            x = r.time + 43200;
          } else {
            x = r.time - 43200;
          }
        } else {
          x = r.time;
        }
        var duration = moment.duration(x, 'seconds');
        var date = moment(App.ctx.getDateRange().start).add(duration.asMilliseconds());
        if (!_this.options.startOnMidnight)
          date = date.subtract(13, 'hours');
        x = date.toDate();

        aux[k].push({
          x: x,
          y: r.data[k] !== null ? k == 'seconds' ? r.data[k] / 60 : r.data[k] : null
        });
      });
    });

    response = _.map(aux, function (values, key) {
      return { 'key': key, 'values': values, 'disabled': false }
    });

    _.each(response, function (el) {
      el.values.sort(function (a, b) { return a.x - b.x; });
    });

    return response;
  },
});

App.Collection.Variables.Ranking = App.Collection.Post.extend({
  initialize: function (models, options) {
    this.options = options;
  },

  url: function () {
    return App.config.api_url + '/' +
      this.options.id_scope + '/variables/ranking/' +
      this.options.mode
  }
});

App.Collection.Variables.Weekserie = App.Collection.Post.extend({
  url: function () {
    return App.config.api_url + '/' + this.options.id_scope + '/variables/'
      + this.options.id_variable + '/weekserie';
  }
});

App.Collection.Variables.Unique = App.Collection.Post.extend({
  url: function () {
    return App.config.api_url + '/' + this.options.id_scope + '/variables/' + this.options.id_variable + '/unique';
  }
});

App.Collection.Variables.Historic = App.Collection.Post.extend({
  initialize: function (models, options) {
    this.options = options;

    this.options.data = {
      agg: this.options.agg,
      time: {
        start: this.options.start,
        finish: this.options.finish,
      },
      filters: this.options.filters || {}
    };
  },
  url: function () {
    return App.config.api_url + '/' + this.options.id_scope + '/variables/' + this.options.id_variable + '/historic';
  }
});

App.Collection.Variables.Simple = App.Collection.Post.extend({
  initialize: function (models, options) {
    this.options = options;

    this.options.data = {
      agg: this.options.agg,
      vars: this.options.vars,
      csv: this.options.csv || false,
      findTimes: this.options.findTimes || false,
      time: {
        start: this.options.start,
        finish: this.options.finish,
        step: this.options.step
      },
      filters: this.options.filters || {}
    };
  },

  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/variables/timeserie'
  },

  parse: function (response) {
    if (this.options.filters && this.options.filters.group) {
      let groupKey = this.options.filters.group;
      let valueKey = this.options.vars[0];
      let data = response.reduce(function (acum, elem, idx) {
        acum[elem.time] = acum[elem.time] || {};
        acum[elem.time][elem.data[groupKey]] = elem.data[valueKey];
        return acum;
      }, {});
      let keys = Object.keys(data);
      let formattedData = [];
      keys.forEach(function (key) {
        formattedData.push({ step: key, elements: data[key] });
      });
      return formattedData;
    } else {
      return response;
    }
  }
});
