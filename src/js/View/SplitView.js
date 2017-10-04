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

App.View.Split = Backbone.View.extend({

	events: {
    'click .split_handler': 'toggleMap',
    'click .co_fullscreen_toggle': 'mapFullScreen'
  },


  toggleMap: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('reverse');
    
    if(this._mapView)
    	this._mapView.$el.toggleClass('collapsed');
    
    this.$('.data.h50').toggleClass('expanded');

    if(this._dateView){
    	this._dateView.$el.toggleClass('compact');
    	this._dateView._compact = $(e.currentTarget).hasClass('reverse') ? true : false;
    }

    if(this._layerTree){
			this._layerTree.$el.removeClass('active').toggleClass('compact');
			this._layerTree.$el.find('h4.active').removeClass('active');
    	this._layerTree._compact = $(e.currentTarget).hasClass('reverse') ? true : false;    	
    }

    if(this._mapSearch){
    	this._mapSearch._clearSearch();
        this._mapSearch.toggleView();
    }

    
    this.$('.co_fullscreen_toggle').toggleClass('hide');
  },

  mapFullScreen: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('restore');

    if(this._mapView)
    	this._mapView.$el.toggleClass('expanded');
    
    this.$('.split_handler').toggleClass('hide');
    this.$('.data.h50').toggleClass('collapsed');
    var _this = this;

    if(this._mapView){
    	setTimeout(function(){
      	_this._mapView.map.invalidateSize();
    	}, 300);
    }

  }



});
