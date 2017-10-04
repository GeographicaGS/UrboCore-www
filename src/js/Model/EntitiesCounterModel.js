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

App.Model.EntitiesCounter = Backbone.Model.extend({
  default: {
    options: {
      id: '',
      scope: '',
      entity: ''
    }
  },
  initialize: function(options){
    if(!options || !options.scope || !options.entity){
      throw new Error('Counter needs scope and ID to initialize');
    }
    this.options = {
      id: options.id,
      scope: options.scope
    };
    if(options.id)
      this.url = App.config.api_url + '/' + options.scope +'/'+ options.entity + '/' + options.id + '/map/counters';
    else
      this.url = App.config.api_url + '/' + options.scope +'/'+ options.entity + '/map/counters';
    this._ctx = App.ctx;
  },
  fetch: function(options) {
  	var options = options || {};

    options.type = 'POST';
    options.dataType = 'json';
    options.contentType = 'application/json';
    options.data = {};
    if(options.params){
      options.data.variables = {
        'waste.issue.status': options.params.filters.status,
        'waste.issue.category': options.params.filters.category
      };
    }
    if(this._ctx.get('bbox')){
      options.data.bbox = _.map(this._ctx.get('bbox'), function(e){
        return parseFloat(e);
      }).join();
    }
    // TODO: Change this id == 'issues' check to something better
    if(this.options.id == 'issues' && this._ctx.get('start') && this._ctx.get('finish')){
      var date = this._ctx.getDateRange();
      options.data.start = date.start;
      options.data.finish = date.finish;
    }
    options.data = JSON.stringify(options.data);

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
