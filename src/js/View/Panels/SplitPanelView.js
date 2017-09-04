'use strict';

App.View.Panels.Splitted = App.View.Panels.Base.extend({
  _template: _.template( $('#dashboard_split_template').html() ),

  className: 'fill_height flex',

	events: _.extend(
    {
      'click .split_handler': 'toggleTopHiding',
      'click .co_fullscreen_toggle': 'toggleTopFullScreen'
    },
    App.View.Panels.Base.prototype.events
  ),

  toggleTopHiding: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('reverse');
    this.$('.bottom.h50').toggleClass('expanded');

    this._onTopHidingToggled(e);
  },

  // Actions to perform when the top panel hiding mode is toggled
  _onTopHidingToggled: function(e){
    if(this._mapView)
      this._mapView.$el.toggleClass('collapsed');

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

  toggleTopFullScreen: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('restore');

    this.$('.split_handler').toggleClass('hide');
    this.$('.bottom.h50').toggleClass('collapsed');

    this._onTopFullScreenToggled();
  },

  // Actions to perform when the top panel full screen mode is toggled
  _onTopFullScreenToggled: function(){
    var _this = this;
    if(this._mapView){
      this._mapView.$el.toggleClass('expanded');
    	setTimeout(function(){
      	_this._mapView.map.invalidateSize();
    	}, 300);
    }
  }
});
