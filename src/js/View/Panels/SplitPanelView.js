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

App.View.Panels.Splitted = App.View.Panels.Base.extend({

  _template: _.template($('#dashboard_split_template').html()),

  className: 'fill_height flex',

  events: _.extend(
    {
      'click .split_handler span:not(.disabled)': 'toggleSplitPanels',
      'click .co_fullscreen_toggle': 'toggleTopFullScreen',
      'click #backdetail': '_goBack'
    },
    App.View.Panels.Base.prototype.events
  ),

  /**
   * Toggle the different split panel elements
   * 
   * @param {Object} e - handler event
   */
  toggleSplitPanels: function (e) {
    e.preventDefault();

    var target = e.currentTarget;
    var parentTarget = e.currentTarget.parentElement;
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');

    // remove 'disabled' class to child
    $(parentTarget).find('span').removeClass('disabled');

    // push "arrow-up"
    if ($(target).hasClass('arrow-up')) {
      if (!$(topSplitElement).hasClass('expanded')) {
        // hide top spliter
        this._collapseTop();
      } else if ($(topSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialPositions();
      }
    }

    // push "arrow-down"
    if ($(target).hasClass('arrow-down')) {
      if ($(bottomSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialPositions();
      } else if (!$(bottomSplitElement).hasClass('expanded')) {
        // hide bottom
        this._collapseBottom();
      }
    }

    // toogle elements in top panel
    this._toggleElementsTopPanel();

    // Resize map
    this._resizeToggledMap();
  },

  /**
   * Initial position to split panel
   */
  _initialPositions: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');
    var buttonFullScreen = this.$el.find('.co_fullscreen_toggle');

    // top
    $(topSplitElement).removeClass('collapsed');
    $(topSplitElement).removeClass('expanded');
    // bottom
    $(bottomSplitElement).removeClass('expanded');
    $(bottomSplitElement).removeClass('collapsed');
    // handler
    $(splitHandlerElement).removeClass('top-collapsed');
    $(splitHandlerElement).removeClass('bottom-collapsed');
    // handler-arrow
    $(splitHandlerElement).find('span.arrow-up, span.arrow-down')
      .removeClass('disabled');
    // show button full-screen
    $(buttonFullScreen).removeClass('hide');
    $(buttonFullScreen).removeClass('restore');
  },

  /**
   * collapse top element
   */
  _collapseTop: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');
    var buttonFullScreen = this.$el.find('.co_fullscreen_toggle');

    // top
    $(topSplitElement).addClass('collapsed');
    $(topSplitElement).removeClass('expanded');
    // bottom
    $(bottomSplitElement).addClass('expanded');
    $(bottomSplitElement).removeClass('collapsed');
    // handler
    $(splitHandlerElement).addClass('top-collapsed');
    $(splitHandlerElement).removeClass('bottom-collapsed');
    // handler-arrow
    $(splitHandlerElement).find('span.arrow-up').addClass('disabled');
    $(splitHandlerElement).find('span.arrow-down').removeClass('disabled');
    // hide button full-screen
    $(buttonFullScreen).addClass('hide');
  },

  /**
   * collapse bottom element
   */
  _collapseBottom: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');
    var buttonFullScreen = this.$el.find('.co_fullscreen_toggle');

    // top
    $(topSplitElement).removeClass('collapsed');
    $(topSplitElement).addClass('expanded');
    // bottom
    $(bottomSplitElement).removeClass('expanded');
    $(bottomSplitElement).addClass('collapsed');
    // handler
    $(splitHandlerElement).removeClass('top-collapsed');
    $(splitHandlerElement).addClass('bottom-collapsed');
    // handler-arrow
    $(splitHandlerElement).find('span.arrow-up').removeClass('disabled');
    $(splitHandlerElement).find('span.arrow-down').addClass('disabled');
    // show button full-screen
    $(buttonFullScreen).removeClass('hide');
    $(buttonFullScreen).addClass('restore');
  },

  /**
   * toggle (hide or show) other panel elements
   */
  _toggleElementsTopPanel: function () {
    var splitHandlerArrows = 
      this.$el.find('.split_handler span.disabled');
    var buttonFullScreen = 
      this.$el.find('.co_fullscreen_toggle');

    if (splitHandlerArrows.length > 0
        && $(splitHandlerArrows).hasClass('arrow-up')) {
      // Hide elements

      // Date
      if (this._dateView) {
        this._dateView.$el.addClass('compact');
        this._dateView._compact = true;
      }

      // Filters
      if (this._layerTree) {
        this._layerTree.$el.removeClass('active').addClass('compact');
        this._layerTree.$el.find('h4.active').addClass('active');
        this._layerTree._compact = true;
      }

      // Mapsearch
      if (this._mapSearch) {
        this._mapSearch._clearSearch();
        this._mapSearch.toggleView();
      }

      // button "fullscreen"
      $(buttonFullScreen).hasClass('hide');

    } else {
      // Show elements

      // Date
      if (this._dateView) {
        this._dateView.$el.removeClass('compact');
        this._dateView._compact = false;
      }

      // Filters
      if (this._layerTree) {
        this._layerTree.$el.removeClass('active').removeClass('compact');
        this._layerTree.$el.find('h4.active').removeClass('active');
        this._layerTree._compact = false;
      }

      // Mapsearch
      if (this._mapSearch) {
        this._mapSearch._clearSearch();
        this._mapSearch.toggleView();
      }

      // Button "fullscreen"
      $(buttonFullScreen).hasClass('hide');
    }
  },

  toggleTopFullScreen: function (e) {
    e.preventDefault();

    // set 'restore' class over target
    $(e.currentTarget).toggleClass('restore');

    // set right CSS classes over "splitHandler"
    if ($(e.currentTarget).hasClass('restore')) {
      this._collapseBottom();
    } else {
      this._initialPositions();
    }

    this._resizeToggledMap();
  },

  /**
   * Resize map after N seconds
   */
  _resizeToggledMap: function () {
    if (this._mapView) {
      setTimeout(function () {
        this._mapView.resetSize();
      }.bind(this), 300);
    }
  }
});
