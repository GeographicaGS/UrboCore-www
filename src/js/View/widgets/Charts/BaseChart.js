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

App.View.Widgets.Charts.Base = Backbone.View.extend({
  _template: _.template($('#chart-base_context_chart').html()),
  _template_tooltip: _.template($('#chart-base_charttooltip').html()),
  _list_variable_template: _.template($('#chart-base_chart_legend').html()),

  /*
  * options:
  *   - data (Backbone Collection, mandatory || optional). Chart data. It probably will need to be parsed.
  *   - opts (Backbone Model, mandatory). Config object.
  *     - template (String, optional) HTML template for the widget
  *     - tooltipTemplate (String, optional) HTML template for the tooltip
  *     - legendTemplate (String, optional) HTML template for the legend
  *     - legendNameFunc (Function, optional) Forces a legend name. Parameter: key
  *     - legendOrderFunc (Function, optional) Forces a legend keys order. Parameter: key
  *     - showAggSelector (Boolean, optional) Show aggregation selectors on the legend if available. Default: false
  *     - hideLegend (Boolean, optional) Default: false
  *     - tooltipFunc: (Function, optional) Parses the needed info to show in a tooltip
  *     - hideTooltip (Boolean, optional) Default: false
  *     - xAxisFunction (JS Function, optional) Function to format X axis values
  *     - yAxisFunction (JS Function, optional) Function to format Y axis values
  *     - xAxisLabel (String, optional) Label for X axis
  *     - yAxisLabel (String, optional) Label for Y axis
  *     - xAxisDomain (Array of numbers, optional) Forces the X axis domain. Format: [min,max]
  *     - yAxisDomain (Array of numbers, optional) Forces the Y axis domain. Format: [min,max]
  *     - yAxisAdjust (Boolean, optional) Forces Y axis to adjust to domain
  *     - colors (Array of strings or Function, optional) Set of colours for each legend element. Format: ['#FFFFFF',...]
  *     - maxColors (Integer, optional),
  *     - classes (Array of strings or Function, optional) Set a custom CSS class to each key. Similar to colors parameter.
  *     - noDataMessage (String, optional) Sets a custom message to show when there is no data to draw
  *     - currentStep (Model, optional) Enable steps control and sets the current Step. This model needs a 'step' attribute.
  *     - hideStepControl (Boolean, optional) Force disable steps control
  */
  initialize: function (options) {
    this.options = options.opts || new App.Model.BaseChartConfigModel({});

    this.collection = options.data;
    this.listenTo(this.collection,"reset",this._drawChart);

    this._initAggs();

    this._internalData = {
      disabledList: {},
      elementsDisabled: 0
    };

    // Allow overwrite the different templates
    if (this.options.get('template')) {
      this._template = this.options.get('template');
    }
    if (this.options.get('tooltipTemplate')) {
      this._template_tooltip = this.options.get('tooltipTemplate');
    }
    if (this.options.get('legendTemplate')) {
      this._list_variable_template = this.options.get('legendTemplate');
    }

    // Hack to allow formatting X axis according to current chart config
    if (this.options.get('xAxisFunction')) {
      this.xAxisFunction = this.options.get('xAxisFunction');
      _.bindAll(this, 'xAxisFunction');
    }

    _.bindAll(this, '_tooltipContentGenerator');
  },

  events: {
    'click .btnLegend .text.first': '_clickLegend',
    'click .popup_widget.step .varsel li': '_changeStep',
    'click .popup_widget.agg li': '_changeAgg'
  },

  onClose: function () {
    this.stopListening();
  },

  render: function () {
    if (this.options.has('currentStep')) {
      var dates = null;
      
      if (this.collection && this.collection.timeMode === '24h') {
        dates = { start: moment.utc().subtract(24, 'hours'), finish: moment.utc() }
      }
      
      this.options.set({ stepsAvailable: App.Utils.getStepsAvailable(dates) });
      
      if (!_.contains(this.options.get('stepsAvailable'), this.options.get('currentStep'))) {
        this.options.set({ currentStep: this.options.get('stepsAvailable')[this.options.get('stepsAvailable').length - 1] });
      }
    }

    this.setElement(this._template({
      'm': this.options.toJSON()
    }));

    this.$el.append(App.widgetLoading());

    try {
      this._fetchData();
    } catch (e) {
      this._drawChart();
    }

    return this;
  },

  _initAggs: function () {
    // Aggregation
    this._aggregationInfo = {};
    var _this = this;
    if (this.options.get('showAggSelector') && this.collection.options && this.collection.options.data && this.collection.options.data.agg && this.collection.options.data.agg.length > 0) {
      _.each(this.collection.options.data.vars, function (var_id, idx) {
        var varMetadata = App.mv().getVariable(var_id);
        if (varMetadata && varMetadata.get('var_agg') && varMetadata.get('var_agg').length > 0) {
          _this._aggregationInfo[var_id] = {
            available: varMetadata.get('var_agg'),
            current: _this.collection.options.data.agg[idx]
          };
        }
      });
    } else {
      this._aggregationInfo = false; // Ensure checks
    }
  },

  _drawChart: function () {
    // Process data
    this._processData();

    // Create chart
    this._initChartModel();

    // Order data keys for legend
    if (this.options.get('legendOrderFunc')) {
      this._orderLegendKeys();
    }

    // Fix for sometimes incorrectly hidden legend in watemeter historic widget
    $(this.el).children('.var_list').removeClass('hide');

    // Append data to chart
    d3.select(this.$('.chart')[0])
      .datum(this.data)
      .call(this._chart);

    // Create legend
    this._initLegend();

    // Create tooltips
    this._initTooltips();

    // Adjustments
    if (this.options.get('centerLegend')) {
      this._centerLegend();
    }

    if (this.options.get('xAxisLabel')) {
      this._chart.xAxis.axisLabel(this.options.get('xAxisLabel'));
    }

    if (this.options.get('yAxisLabel')) {
      if (this._chart.yAxis) {
        this._chart.yAxis.axisLabel(this.options.get('yAxisLabel'));
      } else if (this.options.get('yAxisLabel').length >= 2) {
        this._chart.yAxis1.axisLabel(this.options.get('yAxisLabel')[0]);
        this._chart.yAxis2.axisLabel(this.options.get('yAxisLabel')[1]);
      }
    }

    if (this.xAxisFunction) {
      this._formatXAxis();
    }

    if (this.options.get('yAxisFunction')) {
      this._formatYAxis();
    }

    if (this.options.has('xAxisDomain')) {
      this._forceXAxisDomain();
    }

    if (this.options.has('yAxisDomain')) {
      this._forceYAxisDomain();
    }

    if (this.options.get('yAxisAdjust')) {
      this._adjustYAxis();
    }

    // Force apply adjustments (TODO: fix this hack)
    var _this = this;
    setTimeout(function () {
      _this._chart.update();
    }, 100);

    nv.utils.windowResize(this._chart.update);

    // Remove loading animation
    this.$('.loading.widgetL').addClass('hiden');
  },

  _fetchData: function () {
    var requestData = this.collection.options.data;

    // Step
    if (this.options.get('currentStep')) {
      requestData.time.step = this.options.get('currentStep');
    }

    // Date
    var date = App.ctx.getDateRange();

    if (this.collection.timeMode === '24h') {
      var date = { start: moment.utc().subtract(24, 'hours'), finish: moment.utc() }
    }

    if (requestData && requestData.time && requestData.time.start) {
      requestData.time.start = date.start;
      requestData.time.finish = date.finish;
    }


    // Aggregation
    if (this._aggregationInfo) {
      var _this = this;
      var aggs = [];
      _.each(this.collection.options.data.vars, function (var_id) {
        if (_this && _this._aggregationInfo[var_id])
          aggs.push(_this._aggregationInfo[var_id].current);
      });
      this.collection.options.data.agg = aggs;
    }

    this.collection.fetch({
      reset: true,
      data: requestData
    });
  },

  /**
   * Process data from collection (option.data)
   */
  _processData: function () {
    // Extract max colors
    var max = _.max(this.collection.toJSON(), function (c) {
      return c.elements.length;
    }).elements.length;

    this._colors = max > this.options.get('maxColors') ? [this.options.get('colors')[0]] : this.options.get('colors');

    // Format data
    this.data = [];
    var _this = this;
    for (var i = 0; i < max; i++) {
      this.data.push({ 'values': [] });
      _.each(this.collection.toJSON(), function (elem) {
        var value = 0;
        if (i < elem.elements.length) {
          var key = Object.keys(elem.elements[i])[0];
          value = elem.elements[i][key];
        }
        if (this.data[i]['key'] === undefined)
          this.data[i]['key'] = _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key) ? _this.options.get('legendNameFunc')(key) : key;
        this.data[i]['realKey'] = elem.name;
        this.data[i]['values'].push({ 'x': elem.step, 'y': value });
      });
    }
  },

  _initChartModel: function () {
    throw new Error('initChartModel not implemented');
  },

  _orderLegendKeys: function () {
    var _this = this;
    this.data = _.sortBy(this.data, function (elem) { return _this.options.get('legendOrderFunc')(elem.realKey); });
  },

  _initLegend: function () {
    if (!this.options.get('hideLegend')) {
      this._chart.legend.height(0)
        .width(0)
        .margin(0)
        .padding(0)
        ;

      this.$('.var_list').html(this._list_variable_template({
        colors: this.options.get('colors'),
        data: this.data,
        classes: this.options.get('classes'),
        disabledList: this._internalData.disabledList,
        aggregationInfo: this._aggregationInfo
      }));

      this.$(".nv-legendWrap.nvd3-svg,.legendWrap.nvd3-svg").hide();
    }
  },

  _clickLegend: function (element) {
    var tags = $(".btnLegend").size();
    var realKey = $(element.target).closest("div").attr("id");
    var varMetadata = App.mv().getVariable(realKey);
    var orderKey = $(element.target).closest("div").attr("tag"); // Prevent dups
    realKey = realKey + '_' + orderKey;

    var disabledList = this._internalData.disabledList;

    var disabled = ((disabledList[realKey] === undefined || disabledList[realKey] === false) && this._internalData.elementsDisabled != tags - 1);
    var enabled = (disabledList[realKey] === true);

    if (disabled || enabled) {


      ($(this.$(".chart .nv-series").get($(element.target).parent().attr("tag")))).d3Click();
      $(element.target).parent().toggleClass("inactive");

      if (this.options.get('showAggSelector')) {
        var ch = $(this.$('.agg')[orderKey]);
        ch.toggleClass('hidden');
      }

      disabledList[realKey] = !disabledList[realKey];
      this._internalData.elementsDisabled = disabledList[realKey] ? this._internalData.elementsDisabled + 1 : this._internalData.elementsDisabled - 1;
    }
  },

  _initTooltips: function () {
    if (!this.options.get('hideTooltip')) {
      if (!this.options.get('tooltipFunc')) {
        if (!this._chart.interactiveLayer) {
          this._chart.tooltip.contentGenerator(this._tooltipContentGenerator)
        } else {
          this._chart.interactiveLayer.tooltip.contentGenerator(this._tooltipContentGenerator);
        }
      } else {
        this._chart.tooltip.contentGenerator(this.options.get('tooltipFunc'));
      }
    } else {
      this._chart.tooltip.classes(['hide']);
    }
  },

  _tooltipContentGenerator: function (obj) {
    var templateData = {
      data: obj,
      utils: {}
    };
    if (this.xAxisFunction) {
      templateData.utils.xAxisFunction = this.xAxisFunction;
    }
    if (this.options.get('yAxisFunction')) {
      templateData.utils.yAxisFunction = this.options.get('yAxisFunction');
    }
    return this._template_tooltip(templateData);
  },

  _formatXAxis: function () {
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin') : true)
      .tickFormat(this.xAxisFunction);
  },

  _formatYAxis: function () {
    this._chart.yAxis
      .tickFormat(this.options.get('yAxisFunction'));
  },

  _forceXAxisDomain: function () {
    this._chart.forceX(this.options.get('xAxisDomain'));
  },

  _forceYAxisDomain: function () {
    this._chart.forceY(this.options.get('yAxisDomain'));
  },

  _adjustYAxis: function () {
    this._chart.forceY(this._chart.yAxis.scale().domain());
  },

  _centerLegend: function () {
    if (!this.options.get('hideLegend')) {
      try {
        var yTranslate = d3.transform(d3.select(this.$('.nv-legendWrap')[0]).attr('transform')).translate[1];
        var chartWidth = d3.select(this.$('.chart')[0]).node().getBBox().width;
        var legendWidth = d3.select(this.$('.nv-legendWrap')[0]).node().getBBox().width;
        var margin = 50;
        d3.select('.nv-legendWrap').attr('transform', 'translate(-' + (chartWidth / 2 - legendWidth / 2 - margin) + ',' + yTranslate + ')');
        this._chart.legend.margin().right = (chartWidth / 2 - legendWidth / 2 - margin);
      } catch (e) {
        console.log("Error capturado", e)
      }
    }
  },

  // Controls
  _changeStep: function (e) {
    e.preventDefault();
    var step = $(e.currentTarget).data('step');
    this.options.set({ currentStep: step });
    this.$('.popup_widget.step > span').html(App.stepToStr(step));
    this.$('.popup_widget.step .varsel li.selected').removeClass('selected');
    $(e.currentTarget).addClass('selected');
    this._fetchData();
  },

  _changeAgg: function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var agg = $target.data('agg');
    var var_id = $target.parent().data('id');
    this._aggregationInfo[var_id].current = agg;
    this._fetchData();
  }

});
