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

App.Collection.EntitiesCounterGeneric = Backbone.Collection.extend({
  default: {
    options: {
      id: '',
      scope: '',
      entity: ''
    }
  },

  initialize: function(model,options){
    if(!options || !options.scope || !options.entity){
      throw new Error('Counter needs scope and ID to initialize');
    }
    this.options = {
      scope: options.scope,
      entity: options.entity
    };
    this._ctx = App.ctx;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/entities/map/counters';
  },

  fetch: function(options) {
  	var options = options || {};

    options.data = {};
    if(this._ctx.get('bbox')){
      options.data.bbox = _.map(this._ctx.get('bbox'), function(e){
        return parseFloat(e);
      }).join();
    }
    options.data.entities = this.options.entity;
    // options.data = JSON.stringify(options.data);

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
