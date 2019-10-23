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

App.View.Widgets.Base = Backbone.View.extend({

  _template: _.template($('#widgets-widget_base_template').html()),
  _template_aggs_menu: _.template($('#widgets-widget_base_aggs_menu_template').html()),
  _template_timemode_historic: _.template($('#widgets-widget_date_template').html()),
  _template_timemode_now: _.template($('#widgets-widget_time_template').html()),

  events: {
    'click .botons .tooltipIcon.info': '_onClickIconInfo',
    'click .botons .tooltipIcon.close': '_onClickIconCloseInfo',
    'click .widget_content': '_onClickContent',
    'click .botons .tooltipIcon li.exportable': '_onClickIconExport',
    'click .botons .tooltipIcon li.download': '_onClickIconExport',
    'click .botons .tooltipIcon.download': '_onClickIconExport',
    'click .botons .tooltipIcon.export': '_onClickIconExport',
    'click .widget_header .title .popup_widget.agg ul li': '_onChangeAgg'
  },

  initialize: function (options) {
    // default options to widget
    var defaultOptions = {
      aggsMenu: false,
      aggsMenuOptions: ['SUM', 'MAX', 'AVG', 'MIN'],
      aggSelected: 'SUM',
      title: __('Título del widget'),
      link: null,
      titleLink: null,
      infoTemplate: null,
      exportable: false,
      publishable: false,
      timeMode: 'now',
      refreshTime: false,
      dimension: '',
      type: '',
      correlationTitle: null,
      correlationIcon: null,
      embed: false,
      classname: '',
      context: App.ctx,
      bigTitle: false,
      extraMenu: null,
      footerTemplate: null
    };

    this.options = _.defaults(options || {}, defaultOptions);

    // Merge options (allowed) with the model of "Widget.Base"
    this.model = new App.Model.Widgets.Base(
      _.reduce(defaultOptions, function(sumOptions, option, key) {

        if (typeof this.options[key] !== 'undefined') {
          sumOptions[key] = this.options[key];
        }

        return  sumOptions;
      }.bind(this), {})
    );

    this.ctx = this.model.get('context');

    if (this.options.start) {
      this.ctx.set('start', moment.utc(this.options.start));
    }

    if (this.options.finish) {
      this.ctx.set('finish', moment.utc(this.options.finish));
    }

    if (!this.model.get('embed')) {
      if (this.model.get('timeMode') == 'historic') {
        this.listenTo(this.ctx, 'change:start change:finish', _.debounce(this.refresh, 600));
      }
      this.listenTo(this.ctx, 'change:bbox', this.refresh);
    }

    // TODO: Deprecate.
    this.filterModel = App.getFilter(this.options.id_category);
    if (this.filterModel) {
      this.listenTo(this.filterModel, 'change', this._onChangeFilter);
    }

    // New Filter Model, to manage map and widget filters
    this.newFilterModel = this.options.newFilterModel;
    if (this.newFilterModel) {
      this.listenTo(this.newFilterModel, 'change', this._onChangeFilter)
    }

    if (this.model.get('refreshTime')) {
      this._setRefreshInterval()
    }

    this.subviews = [];
    this.filterables = [];
  },

  /**
   * Check if the current scope has permissions about
   * entities or attributes to show into the widget
   *
   * @return {Boolean} ¿has permissions?
   */
  hasPermissions: function () {
    if (this.model.get('embed')) {
      return true;
    }

    if (this.options && this.options.permissions) {
      return App.mv().validateInMetadata(this.options.permissions);
    }

    return true;
  },

  /**
   * Set the seconds interval to refresh the widget
   */
  _setRefreshInterval: function () {
    if (this.model.get('refreshTime') && this.model.get('timeMode') == 'now') {
      if (this._refreshInterval)
        clearInterval(this._refreshInterval);

      this._refreshInterval = setInterval(function () {
        this.refresh();
      }.bind(this), this.model.get('refreshTime'));
    }
  },

  /**
   * Export the showed data to a CSV file
   *
   * @param {Object} e - triggered event
   */
  _onClickIconExport: function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $target = $(e.currentTarget);
    var _export = $target.data('export');
    var col = this.collection || this.dataModel;
    var options = JSON.parse(JSON.stringify(col.options));
    var params = options.data;
    var model = this.model;

    if (_export === 'csv') {
      // Deep copy
      options.data.csv = true;
      col.fetch({
        dataType: 'text',
        data: options.data,
        success: function (collection, response, options) {
          var csv = new App.Collection.TableToCsv([], {});
          csv.parse(response);
        }
      });

    } else if (_export === 'publish') {
      if (this._popUpView == undefined) {
        this._popUpView = new App.View.PopUpPublish();
      }

      var modeldata = {
        b: btoa(JSON.stringify(params)),
        name: model.get('title'),
        description: null,
        widget: this.options.classname,
        scope: App.currentScope,
        payload: [{
          url: (typeof col.url === 'function') ? col.url() : col.url,
          data: params
        }]
      }

      var collection = new App.Collection.PublishedWidget([], { modeldata: modeldata });
      collection.url = App.config.api_url + '/' + App.currentScope + '/auth/widget/' + this.options.classname;

      var _this = this;
      collection.fetch({

        success: function (collection, response, options) {
          _this._popUpView.internalView = new App.View.Embed({
            collection: collection
          });

          _this.$el.append(_this._popUpView.render().$el);
          _this._popUpView.show();
        },
        error: function (collection, response, options) {
          console.log('ERROR');
          console.log(response);
          console.log(options);
        }
      })
    }
  },

  /**
   * Change the aggregation option
   *
   * @param {Object} e - triggered event
   */
  _onChangeAgg: function (e) {
    e.preventDefault();
    e.stopPropagation();

    var currentAgg = $(e.currentTarget).data('agg');

    // Set in model
    this.model.set('aggSelected', currentAgg);
    // Changes in the DOM
    this.$('.widget_header .title .popup_widget.agg .currentAggSelected')
      .html(App.getAggStr(currentAgg));
    this.$('.widget_header .title .popup_widget.agg ul li')
      .removeClass('selected');
    this.$('.widget_header .title .popup_widget.agg ul li[ data-agg="' + currentAgg + '"]')
      .addClass('selected');
    // Trigger event to child views
    this.trigger('change-agg', currentAgg);
  },

  /**
   * Show more information about widget
   *
   * @param {Object} e - triggered event
   */
  _onClickIconInfo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this.$('.tooltipIcon.close')
      .removeClass('hide')
      .siblings().addClass('hide');
    this.$('.info_container').removeClass('hide');
    this.$('.widget_content').addClass('hide');
  },

  /**
   * Hide the information about the widget
   *
   * @param {*} e - triggered event
   */
  _onClickIconCloseInfo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this.$('.tooltipIcon.close')
      .addClass('hide')
      .siblings().removeClass('hide');
    this.$('.info_container').addClass('hide');
    this.$('.widget_content').removeClass('hide');
  },

  /**
   * Event triggered when do click on widget content
   *
   * @param {*} e - triggered event
   */
  _onClickContent: function (e) {
    if (this.model.get('link')) {
      $('.nvtooltip').css('opacity', 0);
    }
  },

  _onChangeFilter: function () {
    // reset refresh interval
    this._setRefreshInterval();

    if (this.filterables.length) {
      this.render();
    }
  },

  updateFilters: function () {

    for (var i in this.filterables) {

      if (!this.filterables[i].options) {
        this.filterables[i].options = { data: {} };
      }

      if (!this.filterables[i].options.data) {
        this.filterables[i].options.data = {};
      } else if (typeof this.filterables[i].options.data === 'string') {
        this.filterables[i].options.data = JSON.parse(this.filterables[i].options.data);
      }

      var data = this.filterables[i].options.data;
      data.filters = data.filters || {};
      if (this.filterModel) {
        data.filters = this.filterModel.toQuery();
      }
      if (this.newFilterModel) {
        data.filters = this.newFilterModel.toJSON();
      }

      var bbox = this.ctx.getBBOX();

      if (data.filters instanceof Backbone.Model && data.filters.get('the_geom') && bbox) {
        data.filters.get('the_geom')['&&'] = bbox;
      }

      if (bbox) {
        data.filters.bbox = bbox;
      } else if (data.filters.hasOwnProperty('bbox')) {
        delete data.filters.bbox;
      }

      // Corrige la particuridad de que la vista "App.View.Widgets.Gauge"
      // obtiene las modificaciones del modelo en el atributo "data" en
      // lugar del atributo "options.data"
      this.filterables[i].set('data', data);
    }

    return this;
  },

  refresh: function () {
    this.render();
    return this;
  },

  render: function () {
    this.$el.html(this._template(this.model.toJSON()));

    // Put the time icon into the widget
    this.drawTimeIcon();

    // Add aggregation menu
    if (this.model.get('aggsMenu')) {
      this.drawAggsMenu();
    }

    this.updateFilters();

    for (var i in this.subviews) {
      // Set any events from parent to child
      if (typeof this.subviews[i].handlerChangeAgg === 'function') {
        this.on('change-agg', _.bind(this.subviews[i].handlerChangeAgg, this.subviews[i]));
      }

      // Add to widget to content
      this.$('.widget_content')
        .append(this.subviews[i].render().$el);
    }

    if (this.model.get('footerTemplate')) {
      this.$('.widget_footer').append(this.model.get('footerTemplate'))
    }

    // The event render is launched
    this.trigger('render');

    return this;
  },

  /**
   * Draw the time icon in the widget
   */
  drawTimeIcon: function () {
    var wrapper = this.$el.find('.botons');
    var timeMode = this.model.get('timeMode');

    if (wrapper.length && (timeMode === 'historic' || timeMode === 'now')) {
      var templateTimeIcon = timeMode === 'historic'
        ? this._template_timemode_historic
        : this._template_timemode_now;

      // Remove element DOM
      this.$el.find('#timeIcon').remove();
      // Add template time Icon
      $(wrapper[0]).prepend(templateTimeIcon);
    }
  },

  /**
   * Draw aggregation menu in the widget (title)
   */
  drawAggsMenu: function () {
    var wrapperTitle = this.$('.widget_header .title');
    
    wrapperTitle.append(this._template_aggs_menu({
      aggSelected: this.model.get('aggSelected'),
      aggsMenuOptions: this.model.get('aggsMenuOptions')
    }));
  },

  onClose: function () {
    for (var i in this.subviews) {
      this.subviews[i].close();
    }

    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
  },

  getDataObjectsPayloads: function () {
    var o = [];
    for (var i in this.filterables) {
      o.push(this.filterables[i].payload);
    }
    return o;
  }
});
