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

App.Collection.Devices = Backbone.Collection.extend({
  initialize: function(models,options) {
    this.options = options;
  },

  suffix: '',

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/devices' + this.suffix;
  }

});

App.Collection.DevicesChart = App.Collection.Devices.extend({
  suffix: '/chart'
});

App.Collection.DevicesTable = App.Collection.Devices.extend({
  suffix: '/table'
});

App.Collection.DevicesMap = App.Collection.Devices.extend({
  suffix: '/mapentities',
  modelId: function(attrs) {
    if (attrs.properties && attrs.properties.device_id)
      return attrs.properties.device_id;
    else
      attrs.id;
  }
});

App.Collection.DevicesMapRaw = App.Collection.Devices.extend({
  suffix: '/map'
});

// New collections

App.Collection.DevicesSummary = App.Collection.Devices.extend({
  initialize: function(models,options) {
    this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/devices/' + this.options.entity + '/' + this.options.device + '/summary';
  },

  fetch: function(options) {
    if(!options || !options.data){
      options = options || {};
      options.data= {};
    }

    if(options.data.agg && options.data.agg.length > 0){
      this.options.agg = options.data.agg;
      options.data.agg = options.data.agg;
    }else{
      options.data.agg = this.options.agg;
    }

    if(options.data.vars){
      this.options.vars = options.data.vars;
      options.data.vars = options.data.vars.join();
    }else{
      options.data.vars = this.options.vars.join();
    }

    var dates = App.ctx.getDateRange();
    options.data.start = dates.start;
    options.data.finish = dates.finish;

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

App.Collection.DeviceTimeSerie = Backbone.Collection.extend({
  initialize: function(models,options) {
    this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/devices/' + this.options.entity + '/' + this.options.device + '/timeserie';
  },

  fetch: function(options) {
    if(!options || !options.data){
      options = options || {};
      options.data= {};
    }

    if(this.options.format)
    options['data']['format'] = this.options.format;

    // Needs agg, vars, start, finish, step

    if(options.data.agg){
      this.options.agg = options.data.agg;
      options.data.vars = options.data.vars.join();
    }else{
      if(this.options.agg.length !== undefined)
      options.data.agg = this.options.agg.join();
      else
      options.data.agg = _.map(this.options.agg,function(v,k){ return v.toLowerCase(); }).join();
    }

    if(options.data.vars){
      this.options.vars = options.data.vars;
      options.data.vars = options.data.vars.join();
    }else{
      options.data.vars = this.options.vars.join();
    }

    if(options.data.step)
    this.options.step = options.data.step;
    else
    options.data.step = this.options.step;

    var dates = App.ctx.getDateRange();
    options.data.start = dates.start;
    options.data.finish = dates.finish;

    if(!options.dataType || options.dataType !== "text"){
      if(this.options.page !== undefined)
      options.data.page = this.options.page;
      if(this.options.pageSize)
      options.data.pageSize = this.options.pageSize;
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  nextPage: function(){
    this.options.page += 1;
  },

  resetPage: function(){
    this.options.page = 0;
  }
});

// App.Collection.DeviceTimeSerieChart = App.Collection.DeviceTimeSerie.extend({
App.Collection.DeviceTimeSerieChart = Backbone.Collection.extend({

  initialize: function(models,options){
    this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/variables/timeserie';
  },

  fetch: function(options) {
    options.type='POST';
    options.contentType='application/json';
    options.data=JSON.stringify({

      agg:_.map(this.options.agg, function(val){ return val }),
      vars:this.options.vars,
      time: {
        start: App.ctx.getDateRange().start,
        finish: App.ctx.getDateRange().finish,
        step: this.options.vars
      },
      findTimes : false,
      filters: {
        condition:{id_entity__eq:this.options.id}
      }

    });
    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  parse: function(response) {

    var aux = {};

    _.each(response, function(r) {
      _.each(Object.keys(r.data), function(k) {
        if(!aux[k])
        aux[k] = [];
        if(r.data[k] != null)
        aux[k].push({'x':new Date(r.time), 'y':k == 'seconds' ? r.data[k]/60:r.data[k]});
      });
    });

    response = _.map(aux, function(values, key){
      var disabled = false;
      var meta = App.mv().getVariable(key);
      if(meta && meta.get('config') && meta.get('config').hasOwnProperty('default'))
      disabled = !meta.get('config').default
      return {'key':key, 'realKey':key, 'values':values, 'disabled':disabled}
    });

    return response;
  },
});

App.Collection.DeviceRaw = App.Collection.Post.extend({
  // initialize: function(models,options) {
  //   this.options = options;
  //   //this.options.page = this.options.page || 0;
  // },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/devices/' + this.options.entity + '/' + this.options.device + '/raw';
  },

  fetch: function(options) {
    if(!options || !options.data){
      options = options || {};
      options.data= {};
    }

    if(this.options.format)
    options['data']['format'] = this.options.format;

    options.data.time = App.ctx.getDateRange();
    options.data.vars = this.options.variables;

    // if(App.ctx.get('bbox'))
    //   options.data.bbox = App.ctx.get('bbox').join();

    // if(!options.dataType || options.dataType !== "text"){
    //   if(this.options.page !== undefined)
    //     options.data.page = this.options.page;
    //   if(this.options.pageSize)
    //    options.data.pageSize = this.options.pageSize;
    // }

    // if(this.options.agg){
    //   options.data.agg = _.map(this.options.agg,function(v,k){ return v.toLowerCase(); }).join();
    //   if(this.options.variables)
    //     options.data.vars = _.map(this.options.variables,function(v,k){ return v.id; }).join();
    //   else
    //     options.data.vars = _.map(this.options.variables,function(v,k){ return k; }).join();
    // }


    return App.Collection.Post.prototype.fetch.call(this, options);
  },

  // nextPage: function(){
  //   this.options.page += 1;
  // },
  //
  // resetPage: function(){
  //   this.options.page = 0;
  // }
});
