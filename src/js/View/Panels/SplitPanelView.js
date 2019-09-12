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
        // toogle elements in top panel
        this._toggleElementsTopPanel();
      } else if ($(topSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialPositions();
        // Resize map
        this._resizeMapElement();
      }
    }

    // push "arrow-down"
    if ($(target).hasClass('arrow-down')) {
      if ($(bottomSplitElement).hasClass('expanded')) {
        // go back to split initial
        this._initialPositions();
        // toogle elements in top panel
        this._toggleElementsTopPanel();
        // Resize map
        this._resizeMapElement();
      } else if (!$(bottomSplitElement).hasClass('expanded')) {
        // hide bottom
        this._collapseBottom();
        // Resize map
        this._resizeMapElement();
      }
    }
  },

  /**
   * Initial position to split panel
   */
  _initialPositions: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

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
  },

  /**
   * collapse top element
   */
  _collapseTop: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

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
  },

  /**
   * collapse bottom element
   */
  _collapseBottom: function () {
    var topSplitElement = this.$el.find('.top.h50');
    var bottomSplitElement = this.$el.find('.bottom.h50');
    var splitHandlerElement = this.$el.find('.split_handler');

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
  },

  /**
   * toggle (hide or show) other panel elements
   */
  _toggleElementsTopPanel: function () {
    // Date
    if (this._dateView) {
      this._dateView.$el.toggleClass('compact');
      this._dateView._compact = !this._dateView._compact;
    }

    // Filters
    if (this._layerTree) {
      // old filters
      this._layerTree.$el.toggleClass('active')
        .toggleClass('compact');
      this._layerTree.$el.find('h4.active')
        .toggleClass('active');
      this._layerTree._compact = !this._layerTree._compact;
      // new filters
      this._layerTree.$el.find('#layer-tree')
        .toggleClass('compact');
    }

    // Mapsearch
    if (this._mapSearch) {
      this._mapSearch._clearSearch();
      this._mapSearch.toggleView();
    }

    // Spatial
    if (this.filterSpatialView) {
      this.filterSpatialView.$el.toggleClass('hide');
    }
  },

  /**
   * Resize map after N seconds
   */
  _resizeMapElement: function () {
    if (this._mapView && typeof this._mapView.resetSize === 'function') {
      setTimeout(function () {
        this._mapView.resetSize();
      }.bind(this), 300);
    }
  }
});
