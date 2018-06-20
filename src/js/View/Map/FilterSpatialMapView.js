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

App.View.Map.FilterSpatial = Backbone.View.extend({
  _template: _.template( $('#map-filter_spatial_template').html()),

  initialize: function(options) {
    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:bbox_status change:bbox_info',this.render);
  },

  events: {
  	'click .button_filter' : '_toggleFilter',
  	'click .info a' : '_closeInfo',
  },

  onClose: function(){
    this._ctx.set('bbox_status',false);
    this._ctx.set('bbox_info',false);    
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({
      info: this._ctx.get('bbox_info'),
      status: this._ctx.get('bbox_status')
    }));

    return this;
  },

  _toggleFilter:function(e){
  	this._ctx.set('bbox_status',!this._ctx.get('bbox_status'));
  },

  _closeInfo:function(e){
  	e.preventDefault();
  	e.stopPropagation();
  	this._ctx.set('bbox_info',false);
  }

});
