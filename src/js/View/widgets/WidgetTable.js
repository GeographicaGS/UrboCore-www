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

  initialize: function (options) {
    this.options = _.defaults(options, {
      listenContext: true,
      context: App.ctx,
    });

    this._listenContext = this.options.listenContext;
    this.model = options.model;
    this.collection = options.data;
    this.ctx = options.context;

    // Re-draw table if context changes
    if (this._listenContext) {
      this.collection.options.data = {};
    }

    this.listenTo(this.collection, 'reset', this._drawTable);

    if (options['template']) {
      this._template = options['template'];
    }

    this._tableToCsv = new App.Collection.TableToCsv();
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;
    
    //Adjust top scrollbar when resizing
    if(this.model.get('scrollTopBar')){
      $(window).on('resize', this.setScrollTopBarWidth.bind(this))
    }

    _.bindAll(this, '_showTooltip');
  },

  events: {
    'click .table button': '_downloadCsv',
    //'resize window': 'prueba'
  },
  
  render: function () {
    this.$el.append(App.widgetLoading());

    // Re-draw table if context changes
    if (this._listenContext) {

      // Fix the changes in models and collections (BaseModel & BaseCollections)
      if (this.collection && this.collection.options && typeof this.collection.options.data === 'string') {
        this.collection.options.data = JSON.parse(this.collection.options.data);
      }
      
      if (this.model.get('method') == 'GET') {
        _.extend(this.collection.options.data, this.ctx.getDateRange());
      } else {
        this.collection.options.data.time = this.ctx.getDateRange();
      }
    }

    this.collection.fetch({ reset: true, data: this.collection.options.data });

    return this;
  },

  _drawTable: function () {
    this.$el.html(this._template({ m: this.model, elements: this.collection.toJSON()}));

    if (this.model.get('scrollTopBar') === true) {
      this.setScrollTopBarDOM();
    }

    this.delegateEvents(this.events);
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

  setScrollTopBarWidth: function(){
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
    
    if(this.model.get('scrollTopBar')){
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

    this.listenTo(this.collection, "reset", this._drawTable);

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

    this.listenTo(this.collection, "reset", this._drawTable);

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
