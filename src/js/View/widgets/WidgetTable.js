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

App.View.Widgets.Table = Backbone.View.extend({

  _template: _.template($('#base_table_template').html()),
  _template_content: _.template($('#base_table_content_template').html()),

  events: {
    'click .top-options .button.csv': '_downloadCsv',
    'click .paginator .popup_widget ul li[data-ipp]': '_changePaginator',
    'click .bottom-options .button.arrow:not(.disabled)': '_goToPage',
  },

  initialize: function (options) {
    // default options
    this.options = _.defaults(options || {}, {
      listenContext: true,
      context: App.ctx,
    });

    // model options
    this.model.set(_.extend({}, {
      paginator: false,
      page: 0,
      totalPages: 0, // total pages number
      itemsPerPageCurrent: 15, // items per page (current)
      itemsPerPageOptions: [15, 30, 50, 100]
    }, this.options.model.toJSON()));

    if (this.options['template']) {
      this._template = options['template'];
    }

    this._listenContext = this.options.listenContext;
    this.collection = this.options.data;
    this.ctx = this.options.context;

    // Re-draw table if context changes
    if (this._listenContext) {
      this.collection.options.data = {};
    }

    // Events
    this.listenTo(this.collection, 'reset', this._drawTable);

    // Collection to CSV
    this._tableToCsv = new App.Collection.TableToCsv();
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

    //Adjust top scrollbar when resizing
    if (this.model.get('scrollTopBar')) {
      $(window).on('resize', this.setScrollTopBarWidth.bind(this))
    }

    _.bindAll(this, '_showTooltip');
  },

  /**
   * When we click on the paginator selector
   *
   * @param {*} e - triggered event
   */
  _changePaginator: function (e) {
    e.preventDefault();

    var ipp = Number.parseInt($(e.currentTarget).attr('data-ipp'), 10);

    this.model.set('itemsPerPageCurrent', ipp);
    this.model.set('page', 0);
    this.render();
  },
  /**
   * When we click on any arrow
   *
   * @param {*} e - triggered event
   */
  _goToPage: function (event) {
    var currentTarget = event.currentTarget;
    var currentPage = 0;

    if ($(currentTarget).hasClass('init')) {
      currentPage = 0;
    } else if ($(currentTarget).hasClass('prev')) {
      currentPage = this.model.get('page') > 0
        ? this.model.get('page') - 1
        : 0;
    } else if ($(currentTarget).hasClass('next')) {
      currentPage = this.model.get('totalPages') >= this.model.get('page') + 1
        ? this.model.get('page') + 1
        : this.model.get('totalPages');
    } else if ($(currentTarget).hasClass('last')) {
      currentPage = this.model.get('totalPages');
    }

    this.model.set('page', currentPage);
    this._loadElements();
  },

  render: function () {
    // add loading
    this.$el.append(App.widgetLoading());

    // Re-draw table if context changes
    if (this._listenContext) {

      // Fix the changes in models and collections (BaseModel & BaseCollections)
      if (this.collection
          && this.collection.options
          && typeof this.collection.options.data === 'string') {
        this.collection.options.data = JSON.parse(this.collection.options.data);
      }

      if (this.model.get('method') == 'GET') {
        _.extend(this.collection.options.data, this.ctx.getDateRange());
      } else {
        this.collection.options.data.time = this.ctx.getDateRange();
      }
    }

    this.collection.fetch({
      reset: true,
      data: this.collection.options.data
    });

    return this;
  },

  /**
   * draw the table at the beginnig
   */
  _drawTable: function () {

    this.$el.html(this._template({
      m: this.model,
      // "elements" are included to use in old "views"
      elements: this.collection.toJSON()
    }));

    // add loading (after first render)
    this.$el.append(App.widgetLoading());

    if (this.model.get('scrollTopBar') === true) {
      this.setScrollTopBarDOM();
    }

    this.delegateEvents(this.events);

    // Load first page
    this._loadElements();
  },

  /**
   * Draw each page of items
   */
  _loadElements: function () {
    // show loading
    this.$el.find('.loading.widgetL').removeClass('hide');

    var currentPage = this.model.get('page');
    var currentItemsPerPage = this.model.get('itemsPerPageCurrent');
    var totalPages = Number.parseInt(this.collection.toJSON().length/currentItemsPerPage, 10);

    var currentPageDOM = this.$el.find('.bottom-options .paginator-counter .current-page');
    var totalPagesDOM = this.$el.find('.bottom-options .paginator-counter .total-pages');
    var elementsTotalDOM = this.$el.find('.bottom-options .paginator-counter .total');
    var arrowInitDOM = this.$el.find('.bottom-options .paginator-nav .arrow.init');
    var arrowPrevDOM = this.$el.find('.bottom-options .paginator-nav .arrow.prev');
    var arrowNextDOM = this.$el.find('.bottom-options .paginator-nav .arrow.next');
    var arrowLastDOM = this.$el.find('.bottom-options .paginator-nav .arrow.last');
    var tableDOM = this.$el.find('.table table tbody');
    
    var elements = this.model.get('paginator')
      ? this._getItesmPages()
      : this.collection.toJSON();

    // Set paginator data in model
    this.model.set('totalPages', totalPages);

    // draw elements in table
    tableDOM.html(this._template_content({
      currentPage: currentPage,
      formats: this.model.get('columns_format'),
      elements: elements,
    }));

    // Set DOM elements
    $(currentPageDOM).html(currentPage);
    $(totalPagesDOM).html(totalPages);
    $(elementsTotalDOM).html(this.collection.toJSON().length);

    // Disabled arrow in paginator
    $(arrowInitDOM).toggleClass('disabled', currentPage <= 0);
    $(arrowPrevDOM).toggleClass('disabled', currentPage <= 0);
    $(arrowNextDOM).toggleClass('disabled', currentPage == totalPages);
    $(arrowLastDOM).toggleClass('disabled', currentPage == totalPages);

    // hide loading
    this.$el.find('.loading.widgetL').addClass('hide');
  },

  /**
   * Get the items page
   *
   * @return {Array} - items page
   */
  _getItesmPages: function () {
    var items = this.collection.toJSON();
    var currentPage = this.model.get('page');
    var currentItemsPerPage = this.model.get('itemsPerPageCurrent');
    var initialItemCurrentPage = currentPage * this.model.get('itemsPerPageCurrent');

    return _.filter(items, function (item, key) {
      return key >= initialItemCurrentPage &&
        key < initialItemCurrentPage + currentItemsPerPage;
    }.bind(this));
  },

  _downloadCsv: function () {
    if (!this._tableToCsv.options.data) {
      // We sure that there are some "data"
      this._tableToCsv.options.data = {};
    } else if (typeof this._tableToCsv.options.data === 'string') {
      // We sure that the "data" is an Object
      this._tableToCsv.options.data = JSON.parse(this._tableToCsv.options.data);
    }

    // Merge the "collection" options with "csv" options
    this._tableToCsv.options = _.extend({}, this._tableToCsv.options, this.collection.options);

    // Add  the neccesary attributes to "data"
    this._tableToCsv.options.data = _.extend({}, this._tableToCsv.options.data, {
      format: this._tableToCsv.options.format,
      data_tz: this._tableToCsv.options.data_tz
    })

    this._tableToCsv.fetch(this._tableToCsv.options);
  },

  _showTooltip: function (element) {
    if (!this.$el.find('.tooltip').get().length) {
      this.$el.append("<span class='tooltip'>" + element.currentTarget.getAttribute('data-tooltip') + "</span>");
    } else {
      $(".tooltip").html(element.currentTarget.getAttribute('data-tooltip'));
    }

    $(".tooltip").css('top', element.clientY - 400);
    $(".tooltip").css('left', element.clientX + 20 - 200);
  },

  setScrollTopBarDOM: function () {
    // scroll bar
    var scrollTopBar = this.$el.find('#top-scroll-bar');
    var scrollable = this.$el.find('.scrollable');
    var table = this.$el.find('table');

    // Width like table content
    if (table.length && scrollTopBar.length) {
      $(scrollTopBar[0]).on('scroll', _.bind(this.handleTopScrollBar, this));
      scrollable.on('scroll', _.bind(this.setPositionScrollTopBar, this));

      // scroll bar content width
      this.setScrollTopBarWidth()
    }
  },

  setScrollTopBarWidth: function () {
    var scrollTopBar = this.$el.find('#top-scroll-bar');
    var table = this.$el.find('table');

    $(scrollTopBar[0]).children().width($(table[0]).width() + Number.parseInt(this.$el.css('padding-left'), 10));
  },

  /**
   * Set position in Scroll Top Bar
   *
   * @param {Object | Event} event
   */
  setPositionScrollTopBar: function (event) {
    var scrollTopBar = this.$el.find('#top-scroll-bar');
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
    var scrollable = this.$el.find('.scrollable');

    scrollable.scrollLeft(moveLeft);
  },

  onClose: function () {
    this.stopListening();

    if (this.model.get('scrollTopBar')) {
      $(window).off('resize', this.setScrollTopBarWidth)
    }
  }

});

App.View.Widgets.TableCustomFilters = App.View.Widgets.Table.extend({
  initialize: function (options) {
    this.options = _.defaults(options, {
      listenContext: true,
      context: App.ctx
    });

    this._listenContext = this.options.listenContext;
    this.model = options.model;
    this.collection = options.data;
    this.ctx = options.context;

    this.listenTo(this.collection, 'reset', this._drawTable);

    if (options['template']) {
      this._template = options['template'];
    }

    this._tableToCsv = new App.Collection.TableToCsv();
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

    _.bindAll(this, '_showTooltip');
  }
});


App.View.Widgets.TableNewCSV = App.View.Widgets.Table.extend({
  events: {
    'click .table button': '_downloadCsv'
  },
  initialize: function (options) {
    this.options = _.defaults(options, {
      listenContext: true,
      context: App.ctx
    });

    this._listenContext = this.options.listenContext;
    this.model = options.model;
    this.collection = options.data;
    this.ctx = options.context;

    this.listenTo(this.collection, 'reset', this._drawTable);

    if (options['template']) {
      this._template = options['template'];
    }

    this._tableToCsv = new App.Collection.TableToCsv()
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

    _.bindAll(this, '_showTooltip');
  },

  _downloadCsv: function () {
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    this._tableToCsv.options.data.csv = true;

    this._tableToCsv.options.reset = false;
    this._tableToCsv.options.dataType = 'text'

    // this._tableToCsv.fetch({'reset':false,'dataType':'text'})
    this._tableToCsv.fetch(this._tableToCsv.options);
  }
});
