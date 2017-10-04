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
  initialize: function(models,options) {
      this.options = options;
      var date = App.ctx.getDateRange();

      this.options.data = {
        agg: this.options.agg,
        vars: this.options.vars,
        csv: this.options.csv || false,
        findTimes: this.options.findTimes || false,
        time: {
          start: date.start,
          finish: date.finish,
          step: this.options.step
        },
        filters: this.options.filters || {}
      };
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/variables/timeserie'
  },

  parse: function(response) {

    if(typeof response === 'object') {

      var aux = {};

      _.each(response, function(r) {
        _.each(Object.keys(r.data), function(k) {
            if(!aux[k])
              aux[k] = [];
            // if(r.data[k] != null)
              aux[k].push({
                x: isNaN(r.time) ? new Date(r.time) : r.time,
                y: r.data[k] !== null ? k == 'seconds' ? r.data[k]/60:r.data[k] : null
              });
        });
      });

      response = _.map(aux, function(values, key){
        return {'key':key, 'values':values, 'disabled':false}
      });

    }

    return response;
  },

  setTimeRange: function(start, finish){
    this.options.data.time.start = start;
    this.options.data.time.finish = finish;
  },

  setStep: function(step){
    this.options.data.time.step = step;
  }
});

App.Collection.Variables.DailyAgg = App.Collection.Post.extend({
  initialize: function(models,options) {
      this.options = _.defaults(options,{data: {}});
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

  url: function(){
    return App.config.api_url + '/' + this.options.id_scope + '/variables/dailyagg';
  },

  setTimeRange: function(start, finish){

    this.options.data.time.start = start;
    this.options.data.time.finish = finish;
  },

  parse: function(response) {
    var aux = {};
    var _this = this;

    _.each(response, function(r) {
      _.each(Object.keys(r.data), function(k) {
        if(!aux[k])
          aux[k] = [];
        var x;
        if (isNaN(r.time)) {
          x = new Date(r.time);
        } else if (!_this.options.startOnMidnight) {
          if(r.time < 43200){
            x = r.time + 43200;
          }else{
            x = r.time - 43200;
          }
        } else {
          x = r.time;
        }
        var duration = moment.duration(x,'seconds');
        var date = moment.utc(duration.asMilliseconds());
        if (!_this.options.startOnMidnight)
          date = date.subtract(13,'hours');
        x = date.toDate();

        aux[k].push({
          x: x,
          y: r.data[k] !== null ? k == 'seconds' ? r.data[k]/60:r.data[k] : null
        });
      });
    });

    response = _.map(aux, function(values, key){
      return {'key':key, 'values':values, 'disabled':false}
    });

    _.each(response,function(el){
      el.values.sort(function(a,b){ return a.x - b.x; });
    });

    return response;
  },
});

App.Collection.Variables.Ranking = App.Collection.Post.extend({
  initialize: function(models,options) {
      this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' +
      this.options.id_scope +'/variables/ranking/' +
      this.options.mode
  }
});

App.Collection.Variables.Weekserie = App.Collection.Post.extend({
  url: function(){
    return App.config.api_url + '/' + this.options.id_scope + '/variables/'
      + this.options.id_variable + '/weekserie';
  }
});

App.Collection.Variables.Unique = App.Collection.Post.extend({
  url: function () {
    return App.config.api_url + '/' + this.options.id_scope + '/variables/' + this.options.id_variable + '/unique';
  }
});
