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

var App = App || {};

App.Utils = {

  //Umbral establecido en horas
  thresholdToDataChartInHours : 150,

  initStepData: function(view) {
    view._stepsAvailable = this.checkStepsAvailable(view);
    view.render();
  },

  checkBeforeFetching: function(view) {
    var stepsAvailable = this.checkStepsAvailable(view);
    var step = view._stepModel ? view._stepModel.get("step") : undefined;
    if(step != undefined) {
      if(!_.contains(stepsAvailable, step)) {
        view._stepModel.set("step", stepsAvailable[0]);
        view.collection.options.step = view._stepModel.get("step");
      }
    }
  },

  checkStepsAvailable: function(view) {
    var start = view._ctx.toJSON().start;
    var finish = view._ctx.toJSON().finish;

    var stepsAvailable = [];

    var thresholdTime = this.thresholdToDataChartInHours;
    var differenceInHours = finish.diff(start, "hour");
    if(differenceInHours <= thresholdTime) {
      stepsAvailable.push('1h');
    }
    if(differenceInHours / 2 <= thresholdTime) {
      stepsAvailable.push('2h');
    }
    if(differenceInHours / 4 <= thresholdTime) {
      stepsAvailable.push('4h');
    }
    if(differenceInHours > 24){
      stepsAvailable.push('1d');
    }
    return stepsAvailable;
  },

  getStepsAvailable: function(){
    var start = App.ctx.toJSON().start;
    var finish = App.ctx.toJSON().finish;

    var stepsAvailable = [];

    var thresholdTime = this.thresholdToDataChartInHours;
    var differenceInHours = finish.diff(start, "hour");
    if(differenceInHours <= thresholdTime) {
      stepsAvailable.push('1h');
    }
    if(differenceInHours / 2 <= thresholdTime) {
      stepsAvailable.push('2h');
    }
    if(differenceInHours / 4 <= thresholdTime) {
      stepsAvailable.push('4h');
    }
    if(differenceInHours > 24){
      stepsAvailable.push('1d');
    }
    return stepsAvailable;
  },

  getStepHours: function(step){
    switch(step){
      case '7d':  return 168;
      case '3d':  return 72;
      case '2d':  return 48;
      case '1d':  return 24;
      case '12h': return 12;
      case '4h':  return 4;
      case '2h':  return 2;
      case '1h':  return 1;
      default:    return -1;
    }
  },

  getFuncArgsNames: function(func) {
    // First match everything inside the function argument parens.
    var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

    // Split the arguments string into an array comma delimited.
    return args.split(',').map(function(arg) {
      // Ensure no inline comments are parsed and trim the whitespace.
      return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function(arg) {
      // Ensure no undefined values are added.
      return arg;
    });
  },

  toDeepJSON: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  capitalizeFirstLetter: function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  getCartoAccount: function(category){
    return App.mv().getCategory(category).get('config').carto.account;
  },

  getParameterByName: function(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  queryParamsToObject: function(){
    var search = location.search.substring(1);
    var params = {};
    var splitted = decodeURI(search).replace(/"/g, '\\"').split('&');
    _.each(splitted, function(i){
      var each = i.split('=');
      var key = each[0];
      var value = each.slice(1).join('=');
      params[key] = value;
    })

    // Just to make sure is JSON-compatible
    return JSON.parse(JSON.stringify(params));
  },

  colorInterpolator: function(min, max, colors, interpolator) {
    var steps = colors.length;
    var formatted = [];
    var diff = (max - min)/steps;
    if(diff > 50) {
      min = Math.floor(min);
      max = Math.floor(max);
      diff = Math.floor(diff);
    }

    // Default: linear interpolator
    var color = 0;
    var _min = min, _max;
    for(var color = 0; color<steps; color++){
      _max = _min + diff;
      if(color + 1 === steps){
        _max = null;
      }
      formatted.push({ min: _min, max: _max, color: colors[color]});
      _min = _min + diff;
    }

    return new Backbone.Collection(formatted);

  },
}

// RANGES
App.Utils.RANGES = {};
App.Utils.RANGES = {
  OK: 1,
  WARNING: 2,
  ERROR: 3
};
App.Utils.ARRAY = [App.Utils.RANGES.OK, App.Utils.RANGES.WARNING, App.Utils.RANGES.ERROR];

App.Utils.rangeStr = function(range){
  if (range == App.Utils.RANGES.OK )
    return 'Correcto';
  else if (range == App.Utils.RANGES.WARNING)
    return 'Peligro';
  else if (range == App.Utils.RANGES.ERROR)
    return 'Error';
  else
    throw "Unknow range "  + range;
}

App.Utils.rangeColor = function(range){
  if (range == App.Utils.RANGES.OK )
    return '#00cc00';
  else if (range == App.Utils.RANGES.WARNING)
    return '#ff9900';
  else if (range == App.Utils.RANGES.ERROR)
    return '#ff3300';
  else
    throw "Unknow range "  + range;
}

App.Utils.ARRAY_KEYS = ['ok','warning','error'];
App.Utils.ARRAY_COLOR = [
  App.Utils.rangeColor(App.Utils.RANGES.OK),
  App.Utils.rangeColor(App.Utils.RANGES.WARNING),
  App.Utils.rangeColor(App.Utils.RANGES.ERROR)
];

App.Utils.rangeOrder = function(d){
  var idx = App.Utils.ARRAY_KEYS.indexOf(d);
  if(idx === -1) idx = 99;
  return idx;
};

App.Utils.toHoursAndMinutes = function(value,type,format){
  var d = moment.duration(value, type);
  var hours = Math.floor(d.asHours());
  var mins = Math.floor(d.asMinutes()) - hours * 60;
  if(!format){
    return (hours<10 ? '0'+hours : hours) + ':' + (mins<10 ? '0'+mins : mins);
  }
  return hours + 'h ' + mins + 'min';
};

App.Utils.lastdataToObject = function(lastdata){
  var obj = {}
  _.each(lastdata, function(o){
    obj[o.var] = o.value;
  });
  return obj;
};

App.Utils.getNextWeek = function() {
  let currentDate = new Date();
  let todayNumber = currentDate.getDay();
  let daysToMonday = 8 - todayNumber; // 7 - today + 1;
  let nextMonday = currentDate.setDate(currentDate.getDate() + daysToMonday);
  let nextWeek = currentDate.setDate(currentDate.getDate() + 6);
  return [new Date(nextMonday), new Date(nextWeek)];
}
