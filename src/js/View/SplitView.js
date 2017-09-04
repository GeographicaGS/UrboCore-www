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
