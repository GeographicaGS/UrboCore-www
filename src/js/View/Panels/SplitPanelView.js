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
      'click .split_handler span:not(.disabled)': 'toggleTopHiding',
      'click .co_fullscreen_toggle': 'toggleTopFullScreen',
      'click #backdetail': '_goBack'
    },
    App.View.Panels.Base.prototype.events
  ),

  /**
   * Toggle map size
   * 
   * @param {Object} e - handler event
   */
  toggleTopHiding: function (e) {
    e.preventDefault();

    var target = e.currentTarget;
    var parentTarget = e.currentTarget.parentElement;
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');

    // remove 'disabled' class to child
    $(parentTarget).find('span').removeClass('disabled');
    
    // set 'disabled' class to target element
    if ($(target).hasClass('arrow-up')
      && !$(topSplitElement).hasClass('collapsed')) {
      $(target).toggleClass('disabled');
    } else if ($(target).hasClass('arrow-down')
      && !$(bottomSplitElement).hasClass('expanded')) {
      $(target).toggleClass('disabled');
    }

    // push "arrow-up"
    if ($(target).hasClass('arrow-up')) {
      if (!$(topSplitElement).hasClass('expanded')) {
        // hide top spliter
        this._collapseTop();
        // toogle elements in top panel
        this._toggleElementsPanel(e);
      } else if ($(topSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialTopAndBottom();
      }
    }

    // push "arrow-down"
    if ($(target).hasClass('arrow-down')) {
      if ($(bottomSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialTopAndBottom();
        // toogle elements in top panel
        this._toggleElementsPanel(e);
      } else if (!$(bottomSplitElement).hasClass('expanded')) {
        // hide bottom
        this._collapseBottom();
      }
    }

    // Resize map
    this._resizeToggledMap();
  },

  /**
   * Initial position to split panel
   */
  _initialTopAndBottom: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

    $(topSplitElement).removeClass('collapsed');
    $(topSplitElement).removeClass('expanded');
    $(bottomSplitElement).removeClass('expanded');
    $(bottomSplitElement).removeClass('collapsed');
    $(splitHandlerElement).removeClass('top-collapsed');
    $(splitHandlerElement).removeClass('bottom-collapsed');
  },

  /**
   * collapse top element
   */
  _collapseTop: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

    $(topSplitElement).addClass('collapsed');
    $(topSplitElement).removeClass('expanded');
    $(bottomSplitElement).addClass('expanded');
    $(bottomSplitElement).removeClass('collapsed');
    $(splitHandlerElement).addClass('top-collapsed');
    $(splitHandlerElement).removeClass('bottom-collapsed');
  },

  /**
   * collapse bottom element
   */
  _collapseBottom: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

    $(topSplitElement).removeClass('collapsed');
    $(topSplitElement).addClass('expanded');
    $(bottomSplitElement).removeClass('expanded');
    $(bottomSplitElement).addClass('collapsed');
    $(splitHandlerElement).removeClass('top-collapsed');
    $(splitHandlerElement).addClass('bottom-collapsed');
  },

  /**
   * toggle (change position) other panel elements
   * 
   * @param {Object} e - event
   */
  _toggleElementsPanel: function (e) {
    // Hide date
    if (this._dateView) {
      this._dateView.$el.toggleClass('compact');
      this._dateView._compact = $(e.currentTarget).hasClass('disabled')
        ? true
        : false;
    }

    // Hide filters
    if (this._layerTree) {
      this._layerTree.$el.removeClass('active').toggleClass('compact');
      this._layerTree.$el.find('h4.active').removeClass('active');
      this._layerTree._compact = $(e.currentTarget).hasClass('disabled')
        ? true
        : false;
    }

    // Hide mapsearch
    if (this._mapSearch) {
      this._mapSearch._clearSearch();
      this._mapSearch.toggleView();
    }

    this.$('.co_fullscreen_toggle').toggleClass('hide');
  },

  toggleTopFullScreen: function (e) {
    e.preventDefault();

    var bottomSplitElement = this.$el.find('.bottom.h50');

    $(e.currentTarget).toggleClass('restore');

    this.$('.split_handler').toggleClass('hide');

    $(bottomSplitElement).toggleClass('collapsed');

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
