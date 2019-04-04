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

App.View.Widgets.TablePaginated = App.View.Widgets.Deprecated.Table.extend({
  
  _template: _.template($('#widgets-widget_table_paginated_template').html()),
  
  events: {
    'click .showMore': 'loadMore',
    'click .table button.downloadButton': '_downloadCsv',
    'scroll': 'scrollHandler'
  },

  className: function () {
    return 'table block ' + this.model.get('class');
  },

  initialize: function (options) {
    App.View.Widgets.Deprecated.Table.prototype.initialize.call(this, options);
    
    if (options.template) {
      this._template = _.template(options.template);
    }
  },

  render: function () {
    this.$el.html(this._template({ 
      m: this.model, 
      elements: this.collection.toJSON(), 
      pageSize: this.collection.options.pageSize 
    }));

    // Set the scroll top bar
    if (this.model.get('scrollTopBar') === true) {
      this.setScrollTopBarDOM();
    }

    return this;
  },

  /**
   * Load more registers in the table
   * 
   * @param {Object Event} event 
   */
  loadMore: function (event) {
    event.preventDefault();

    var expectedLength = this.collection.length + this.collection.options.pageSize;

    $('.table').addClass('loading');
    $('.button.showMore').addClass('loading');

    this.collection.nextPage();
    this.collection.fetch({
      remove: false,
      success: function (response) {
        $('.table').removeClass('loading');
        if (response.length > expectedLength) {
          $('.button.showMore').removeClass('loading');
        } else {
          $('.button.showMore').addClass('hide').removeClass('loading');
        }
      }
    });
  },

  /**
   * Just broadcasts the scroll event up the tree when this 
   * table element ($el) is being scrolled
   * 
   * @param {Object Event} event 
   */
  scrollHandler: function (event) {
    if (this.model.get('scrollTopBar') === true) {
      this.setPositionScrollTopBar(event);
    }
  },

  /**
   * Set the HTML into the DOM to draw the "scroll top bar"
   */
  setScrollTopBarDOM: function () {
    // scroll bar
    var scrollTopBar = this.$el.prev('#top-scroll-bar');
    // Insert before this table
    if (scrollTopBar.length === 0) {
      this.$el.before('<div id="top-scroll-bar"><div></div></div>');
      scrollTopBar = this.$el.prev('#top-scroll-bar');
    }
    // Registers table
    var table = this.$el.find('table');

    // Width like table content
    if (table.length && scrollTopBar.length) {
      $(scrollTopBar[0]).on('scroll', _.bind(this.handleTopScrollBar, this));
      // scroll bar content width
      $(scrollTopBar[0]).children().width($(table[0]).width());
    }
  },

  /**
   * Set position in Scroll Top Bar
   * 
   * @param {Object | Event} event
   */
  setPositionScrollTopBar: function (event) {
    var scrollTopBar = this.$el.prev();
    var moveLeft = $(event.currentTarget).scrollLeft();
    
    // Move scrollTopBar
    if (scrollTopBar.length) {
      $(scrollTopBar[0]).scrollLeft(moveLeft);
    }
  },

  /**
   * handler scroll top bar
   * 
   * @param {Object | Event} event
   */
  handleTopScrollBar: function (event) {
    var moveLeft = $(event.currentTarget).scrollLeft();
    this.$el.scrollLeft(moveLeft);
  }
});

