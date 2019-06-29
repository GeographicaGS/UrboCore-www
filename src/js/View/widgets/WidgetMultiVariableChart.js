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

App.View.Widgets.MultiVariableChart = Backbone.View.extend({
  // Templates
  _template: _.template($('#widgets-widget_multiVariable_chart').html()),
  _popup_template: _.template($('#chart-base_charttooltip').html()),
  _list_variable_template: _.template($('#widgets-widget_multiVariable_list_variables').html()),

  /*
    TODO: Create documentation
    Params:
      el: DOM element (Optional)
      collection: Backbone Collection (Mandatory) Collection containing the chart data
      stepModel: Backbone Model (Optional) Model containing the current step
      multiVariableModel: Backbone Model (Optional) Model containing a set of config
        parameters such as 'category' (string), 'title' (string) or 'aggDefaultValues' (JS Object)
      noAgg: true|false (Optional, default: false) Disables aggregation controls
  */
  initialize: function (options) {
    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this._multiVariableModel = _.defaults(options.multiVariableModel.toJSON() || {}, {
      aggDefaultValues: [],
      normalized: true,
      sizeDiff: 'days',
      yAxisLabelDefault: null
    });
    this.options = {
      noAgg: options.noAgg || false
    };
    this._aggDefaultValues = this._multiVariableModel
      ? this._multiVariableModel.aggDefaultValues
      : [];

    // Use to block the rest request when any
    // date request in working
    this._lockDateRequest = false;

    if (this._stepModel) {
      this.collection.options.step = this._stepModel.get('step');
      this.listenTo(this._stepModel, 'change:step', _.debounce(function () {

        if (!this._lockDateRequest) {
          var regex = /\dd/;

          this._multiVariableModel.sizeDiff = regex.test(this._stepModel.get('step'))
            ? 'days'
            : 'hours';
          this.collection.fetch({
            reset: true,
          });

          this.render();
        }

      }.bind(this), 250, true));
    }

    this.collection.options.agg = this._aggDefaultValues
      ? this._aggDefaultValues
      : this.collection.options.agg;

    this._internalData = {
      disabledList: {},
      elementsDisabled: 0,
      currentAggs: {}
    };

    this.listenTo(this.collection, 'reset', this._drawChart);
    this.collection.fetch({ 'reset': true, data: this.collection.options.data || {} })

    this._ctx = App.ctx;
    this.listenTo(this._ctx, 'change:start change:finish change:bbox',
      _.debounce(function () {

        if (!this._lockDateRequest) {
          // Block the rest of requests
          this._lockDateRequest = true;

          // Fix the changes in models and collections (BaseModel & BaseCollections)
          if (this.collection
            && this.collection.options
            && typeof this.collection.options.data === 'string') {
            this.collection.options.data = JSON.parse(this.collection.options.data);
          }

          if (!this.collection.options.data) {
            this.collection.options.data = { time: {} }
          }
          this.collection.options.data.time.start = this._ctx.getDateRange().start;
          this.collection.options.data.time.finish = this._ctx.getDateRange().finish;

          // Set update step
          App.Utils.checkBeforeFetching(this);
          var currentStep = this._stepModel && this._stepModel.has('step')
            ? this._stepModel.get('step')
            : this.collection.options &&
              this.collection.options.data &&
              this.collection.options.data.step
              ? this.collection.options.data.step
              : this.collection.options.step || '1d';
          var regex = /\dd/;
          this._multiVariableModel.sizeDiff = regex.test(currentStep)
            ? 'days'
            : 'hours';

          this.collection.options.data.time.step = currentStep;

          // Launch request
          this.collection.fetch({
            reset: true,
            data: this.collection.options.data || {},
            success: function () {
              this._lockDateRequest = false; // UnBlock the rest of requests
            }.bind(this)
          })
          // Render
          this.render();

        }


      }.bind(this), 250, true));

    this.render();
  },

  events: {
    'click .nv-series': '_redrawSeries',
    'click .popup_widget.agg li': '_changeAgg',
    'click .popup_widget.step li': '_changeStep',
    'click .btnLegend .text.first': '_clickNewLegend',
    'click .popup_widget.agg': function (e) {
      e.stopPropagation();
    }
  },

  /**
   * When we click on the agreggation selector
   *
   * @param {*} e - triggered event
   */
  _changeAgg: function (e) {
    e.preventDefault();

    var $ulCurrentElement = $(e.currentTarget).closest('ul');
    var realKey = $ulCurrentElement.attr('data-id');
    var currentAggs = this._internalData.currentAggs;
    var agg = $(e.currentTarget).attr('data-agg');

    currentAggs[realKey] = agg;
    // It works with the collection "DeviceTimeSerieChart"
    this.collection.options.agg[realKey] = agg;
    // It works with the collection "TimeSeries"
    this.collection.options.data.agg = _.map(currentAggs, function (value) {
      return value;
    });

    this.collection.fetch({ 'reset': true, data: this.collection.options.data || {} })
    this.render();
  },

  /**
   * When we click on the step selector
   *
   * @param {*} e - triggered event
   */
  _changeStep: function (e) {
    e.preventDefault();
    var step = $(e.currentTarget).attr('data-step');
    this.collection.options.step = step;
    this._stepModel.set('step', step);
    var data = typeof this.collection.options.data === 'string' ? JSON.parse(this.collection.options.data) : this.collection.options.data;
    if (data.time) {
      data.time.step = step;
    }
    this.collection.fetch({ 'reset': true, data: data || {} })
    this.render();
  },

  /**
   * When we click on a label (key) to show or hide
   * the associated values
   *
   * @param {*} event - triggered event
   */
  _clickNewLegend: function (event) {
    var tags = this.$('.btnLegend').size();
    var realKey = $(event.target).closest('div').attr('id');
    var disabledList = this._internalData.disabledList;
    var variable = $(event.target).data('key');

    if (((typeof disabledList[realKey] === 'undefined' || disabledList[realKey] === false) &&
      this._internalData.elementsDisabled !== tags - 1) || disabledList[realKey] === true) {
      $($($('.chart .nv-series')).get($(event.target).parent().attr('tag'))).click();
      $(event.target).parent().toggleClass('inactive');

      disabledList[realKey] = !disabledList[realKey];
      var $aggMenu = $(event.target).closest('div').find('a');

      if ($aggMenu.css('visibility') === 'hidden') {
        $aggMenu.css('visibility', 'visible');
      } else {
        $aggMenu.css('visibility', 'hidden');
      }

      this._internalData.elementsDisabled = disabledList[realKey]
        ? this._internalData.elementsDisabled + 1
        : this._internalData.elementsDisabled - 1;

      // Change attribute "disabled"
      var dataVariable = this.data.findWhere({ key: variable });
      var collectionVariable = this.collection.findWhere({ key: realKey });
      º
      if (typeof dataVariable !== 'undefined') {
        dataVariable.set('disabled', !dataVariable.get('disabled'));
      }

      if (typeof collectionVariable !== 'undefined') {
        collectionVariable.set('disabled', !collectionVariable.get('disabled'));
      }

      var chartData = this.data.where({ 'disabled': false }).length === 1
        ? _.bind(this._getUniqueDataEnableToDraw, this)
        : this.data.toJSON();

      // Put the new data in chart
      this.svgChart
        .datum(chartData)
        .call(this.chart)

      // Change Y Axis
      this._drawYAxis();
    }
  },

  render: function () {
    this.$el.html(this._template({
      s: this._stepModel
        ? this._stepModel.toJSON()
        : null,
      m: this._multiVariableModel || null,
      stepsAvailable: this._stepsAvailable
    }));

    this.$('.widget')
      .append(App.widgetLoading());

    return this;
  },

  /**
   * Draw the chart when the collection is reseted
   */
  _drawChart: function () {
    var oneVarInMultiVar = false;

    // get initial step
    App.Utils.initStepData(this);
    // Hide the loading
    this.$('.loading.widgetL').addClass('hiden');
    // Prepare data to chart
    this.data = this._prepareDataToChart();

    // Set the keys (values) to 'disabled' to hide in the chart
    _.each(this._internalData.disabledList, function (value, key) {
      if (value) {
        this.data.find({ 'realKey': key })
          .set('disabled', true);
        this.collection.find({ 'key': key })
          .set('disabled', true);
      }
    }.bind(this));

    // Set 'normalized' CSS class
    if (this.data.where({ 'disabled': false }).length > 1) {
      d3.select(this.$('.chart')[0])
        .classed('normalized', true);
    } else {
      oneVarInMultiVar = true;
      d3.select(this.$('.chart')[0])
        .classed('normalized', false);
    }

    // Draw the chart with NVD3
    this.chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .margin({ 'right': 45 })
      .height(268)
      .noData(__('No hay datos disponibles'));

    // Without data (CSS)
    if (this.data.length === 0) {
      d3.select(this.$('.chart')[0])
        .classed('without-data', true);
    }

    // Set margin legend
    this.chart
      .legend
      .margin({ bottom: 40 });

    // 'oneVarInMultiVar' = true, en el caso especial de que
    // estemos pintando varias variable pero solo hay activa una
    if (!oneVarInMultiVar) {
      this.svgChart = d3.select(this.$('.chart')[0])
        .datum(this.data.toJSON())
        .call(this.chart);
    } else {
      this.svgChart = d3.select(this.$('.chart')[0])
        .datum(this._getUniqueDataEnableToDraw())
        .call(this.chart);
    }

    // draw X Axis
    this._drawXAxis();

    // draw Y Axis
    this._drawYAxis();

    // draw the tooltip when we are on chart
    this._drawToolTip();

    // draw thresholds
    if (this._multiVariableModel.yAxisThresholds) {
      this._drawThresholds();
    }

    // Update chart (redraw)
    this.chart.update();
    // Update chart (redraw) when the window size changes
    nv.utils.windowResize(this.chart.update);

    // Draw the keys list behind the chart
    this.$('.var_list').html(
      this._list_variable_template({
        colors: this._multiVariableModel.colorsFn || App.getSensorVariableColorList(),
        currentAggs: this._internalData.currentAggs,
        data: this.data.toJSON(),
        disabledList: this._internalData.disabledList,
        noAgg: this.options.noAgg
      })
    );

    $('.nv-legendWrap.nvd3-svg').hide();

    return this;
  },

  /**
   * Prepare the attribute "data" to the chart
   *
   * @return {Array} - parse data
   */
  _prepareDataToChart: function () {
    //Por si el servidor devuelve series con valores a nulos
    _.each(this.collection.where(
      function (c) {
        return c.get('values').length == 0;
      }),
      function (m) {
        this.collection.remove(m);
      }.bind(this)
    );

    var parseData = new Backbone.Collection(
      _.each(this.collection.toJSON(), function (c, index) {
        if (parseData && parseData.length) {
          var data = parseData.findWhere({ 'realKey': c.key });
          if (data != undefined) {
            c.realKey = data.get('realKey');
            c.key = data.get('key');
            c.aggs = data.get('aggs');
            c.currentAgg = data.get('currentAgg');
            c.disabled = this._internalData.disabledList[c.realKey];
            if (this._multiVariableModel.colorsFn) {
              c.color = this._multiVariableModel.colorsFn(c.realKey)
            }
            this.collection.findWhere({ 'key': c.realKey }).set('disabled', c.disabled);
          }
        } else {
          c.realKey = c.key;
          c.key = App.mv().getVariable(c.key).get('name');
          c.aggs = App.mv().getVariable(c.realKey).get('var_agg');
          if (this._multiVariableModel.colorsFn) {
            c.color = this._multiVariableModel.colorsFn(c.realKey)
          }

          // TODO - DELETE AFTER AQUASIG PILOT JULY 2019
          // Remove 'SUM' from variables (metadata)
          if (c.realKey.indexOf('aq_cons.sensor') > -1 && c.aggs.indexOf('SUM') > -1) {
            c.aggs.splice(c.aggs.indexOf('SUM'), 1);
          }
          // END TODO

          //Inicializacion de la estructura interna de datos
          var internalData = this._internalData;
          var meta = App.mv().getVariable(c.realKey);

          // To save the current status in the chart
          if (typeof internalData.disabledList[c.realKey] === 'undefined') {
            if (meta && meta.get('config') && meta.get('config').hasOwnProperty('default')) {
              internalData.disabledList[c.realKey] = !meta.get('config').default
            } else {
              internalData.disabledList[c.realKey] = false;
            }
          }

          if (!this.options.noAgg) {
            var currentDefaultAgg = !_.isEmpty(this._aggDefaultValues)
              ? this._aggDefaultValues[c.realKey]
              : null;
            if ((c.aggs != undefined && c.aggs[0] != 'NOAGG')
              && (_.isEmpty(this._aggDefaultValues) || (currentDefaultAgg != 'NONE'))) {
              if (currentDefaultAgg == undefined || !_.contains(c.aggs, currentDefaultAgg.toUpperCase())) {
                c.currentAgg = c.aggs ? c.aggs[0] : null;
                this.collection.options.agg[c.realKey] = c.currentAgg;
                internalData.currentAggs[c.realKey] = c.currentAgg;
              } else {
                c.currentAgg = currentDefaultAgg;
                this.collection.options.agg[c.realKey] = currentDefaultAgg;
                internalData.currentAggs[c.realKey] = currentDefaultAgg;
              }
            }
          }
        }

        // Normalization using domain if available
        var min, max;
        if (this._multiVariableModel.yAxisDomain &&
          this._multiVariableModel.yAxisDomain[c.realKey] !== undefined) {
          min = this._multiVariableModel.yAxisDomain[c.realKey][0];
          max = this._multiVariableModel.yAxisDomain[c.realKey][1];
        } else {
          min = _.min(c.values, function (v) { return v.y; }).y;
          max = _.max(c.values, function (v) { return v.y; }).y;
        }
        _.each(c.values, function (v) {
          v.y = parseFloat(v.y);
        })
        c.values = _.map(c.values, function (v) {
          // Normalization the charts
          var valueY = this._multiVariableModel.normalized
            ? (max - min) > 0
              ? (v.y - min) / (max - min)
              : 0
            : v.y;

          return {
            x: v.x,
            y: valueY,
            realY: v.y
          }
        }.bind(this));
      }.bind(this))
    );

    return parseData;
  },

  /**
   * Assure that the data (keys) are not replicated
   */
  _getUniqueDataEnableToDraw: function () {
    return _.map(this.collection.toJSON(), function (j) {
      j.realKey = j.key;
      j.key = this.data.findWhere({ 'realKey': j.key }).get('key');
      if (this._multiVariableModel.colorsFn) {
        j.color = this._multiVariableModel.colorsFn(j.realKey)
      }
      return j;
    }.bind(this));
  },

  /**
   * Draw the X values in the chart
   */
  _drawXAxis: function () {
    if (this.chart && this.data.length) {
      var dataChart = this.data.toJSON();
      var startDate = dataChart[0].values[0].x;
      var finishDate = dataChart[0].values[dataChart[0].values.length - 1].x;
      var fnHideMaxMinXAxis = _.debounce(_.bind(this.hideMaxMinXAxis, this), 350);

      // Draw the X axis with values (date) with 'hours'
      // If the difference between dates is minus to two days
      this.chart
        .xAxis
        .showMaxMin(false)
        .tickFormat(function (d) {
          var localdate = moment.utc(d).local().toDate();

          // Same day
          if (moment(finishDate).isSame(moment(startDate), 'day')) {
            return d3.time.format('%H:%M')(localdate);
          } else if ((this._multiVariableModel.sizeDiff === 'hours'
            || this._multiVariableModel.sizeDiff === 'minutes')
            && moment(finishDate).diff(startDate, 'days') >= 1) {
            return d3.time.format('%d/%m - %H:%M')(localdate);
          }
          // Only date
          return d3.time.format('%d/%m/%Y')(localdate);

        }.bind(this))
        .tickValues(this.getXTickValues(dataChart))

      // When the windows is resized
      nv.utils.windowResize(function () {
        // Recalculate the items in X axis
        this.chart
          .xAxis
          .showMaxMin(false)
          .tickValues(this.getXTickValues(dataChart));
        // Remove max and min
        fnHideMaxMinXAxis();
      }.bind(this));
      // Remove max and min
      fnHideMaxMinXAxis();
    }
  },

  /**
   * Draw the Y values in the chart
   */
  _drawYAxis: function () {
    var col = this.data.where({ 'disabled': false });

    // When there is a only key in the chart
    if (col.length === 1) {
      var realKey = col[0].get('realKey');
      var values = col[0].get('values');
      var metadata = App.Utils.toDeepJSON(
        App.mv().getVariable(realKey)
      );
      var format = _.some(values, function (currentValue) {
        return currentValue.realY < 1;
      }) ? App.d3Format.numberFormat(',.3r') : App.nbf;

      // Put the label in Y Axis
      this.chart
        .yAxis
        .axisLabel(
          metadata.name +
          (metadata.units ? ' (' + metadata.units + ')' : '')
        );

      // Put the values in Y Axis
      this.chart
        .yAxis
        .showMaxMin(false)
        .tickFormat(
          this._multiVariableModel.yAxisFunction
            ? this._multiVariableModel.yAxisFunction
            : format
        );
    } else {
      // Show the default Y axis label
      this.chart
        .yAxis
        .axisLabel(this._multiVariableModel.yAxisLabelDefault || '');

      if (this._multiVariableModel.normalized) {
        // Clean the point (values) in Y Axis
        this.chart
          .yAxis
          .showMaxMin(false)
          .tickFormat(function () {
            return ''
          });
      }
    }

    // The changes will be applied to the Y Axis
    this.svgChart
      .selectAll('.nv-focus .nv-y')
      .call(this.chart.yAxis);

    if (this._multiVariableModel.yAxisThresholds) {
      d3.selectAll(this.$('.chart > .nvd3 .nv-focus .nv-y > .nv-axis > g > g.tick:not(.zero)')).attr({ class: 'invisible' }).style({ opacity: 0 });
    }


    // Force y axis domain
    if (this._multiVariableModel.normalized) {
      if (this._multiVariableModel.yAxisDomain &&
        this._multiVariableModel.yAxisDomain[realKey]) {
        this.chart.forceY(this._multiVariableModel.yAxisDomain[realKey]);
      }
    } else {
      if (this._multiVariableModel.yAxisDomain) {
        this.chart.forceY(this._multiVariableModel.yAxisDomain);
      }
    }
  },

  _drawThresholds: function () {
    var _this = this;
    this.chart.dispatch.on('renderEnd', function () {
      d3.selectAll(_this.$('.chart > .nvd3 .nv-focus .nv-y > .nv-axis > g > g.tick:not(.zero)')).attr({ class: 'invisible' }).style({ opacity: 0 });

      if (!d3.selectAll(_this.$('.chart > .nvd3 .nv-focus .th-groups')).empty()) {
        return;
      }
      var chartRect = d3
        .selectAll(_this.$('.chart > .nvd3 .nv-focus'));
      var g = chartRect.append('g').attr({ class: 'th-groups' });
      const lastDate = _this.data.models[0].get('values')[_this.data.models[0].get('values').length - 1].x
      _this._multiVariableModel.yAxisThresholds.forEach(threshold => {
        var thresholdGroup = g.append('g').attr({ class: 'thresholdGroup' });
        var height = _this.chart.yScale()(threshold.startValue) - _this.chart.yScale()(threshold.endValue);
        var width = parseInt(d3.select(_this.$('.chart .nvd3 .nv-focus .nv-background rect')[0])[0][0].getAttribute('width'), 10);

        thresholdGroup.append('line').attr('class', 'thresholds')
          .attr({
            x1: 0,
            x2: width,
            y1: _this.chart.yScale()(threshold.startValue),
            y2: _this.chart.yScale()(threshold.startValue),
            'stroke-dasharray': 4,
            stroke: threshold.color
          });

        thresholdGroup.append('rect')
          .attr('class', 'thresholds')
          .attr({
            x: 0,
            y: _this.chart.yScale()(threshold.endValue),
            width: width,
            height: height,
            fill: threshold.color,
            'fill-opacity': 0.1
          });

        thresholdGroup.append('text')
          .text(__(threshold.realName))
          .attr('class', 'axis-label')
          .attr('x', 10)
          .attr('y', _this.chart.yScale()(threshold.endValue) + height / 2)
          .attr('dy', '.32em')
          .attr('width', width)
          .attr('height', height / 2)
          .attr('class', 'thresholdLabel')
          ;

        thresholdGroup.append('text')
          .text(__(threshold.endValue))
          .attr('class', 'axis-label')
          .attr('x', -15)
          .attr('y', _this.chart.yScale()(threshold.endValue))
          .attr('dy', '.32em')
          .attr('width', width)
          .attr('class', 'thresholdValue')
          ;
      });
    })
  },

  /**
   * Set tooltip when we hover the chart (points)
   */
  _drawToolTip: function () {
    if (this.chart) {
      this.chart
        .interactiveLayer
        .tooltip
        .contentGenerator(function (data) {
          // Each value to tooltip
          _.each(data.series, function (s) {
            var model = this.data.findWhere({ 'key': s.key });

            s['realKey'] = model.get('realKey');
            s.value = _.find(model.get('values'), function (v) {
              return v.x.toString() == data.value.toString();
            }).realY;

            // Change value in tooltip
            if (this._multiVariableModel.toolTipValueFunction) {
              s.value = typeof this._multiVariableModel.toolTipValueFunction === 'function'
                ? this._multiVariableModel.toolTipValueFunction(s.realKey, s.value)
                : s.value;
            }
          }.bind(this));

          return this._popup_template({
            data: data,
            utils: {
              xAxisFunction: function (d) {
                return App.formatDateTime(d);
              }
            }
          });
        }.bind(this));
    }
  },

  /**
   * Get the values to use in X Axis (only work with times in X axis)
   *
   * @param {Array} data - data to draw in chart
   * @return {Array} data to draw in chart
   */
  getXTickValues: function (data) {
    if (data.length && data[0].values.length) {
      // date start
      var dateStart = data[0].values[0].x;
      // date finish
      var dateFinish = data[0].values[data[0].values.length - 1].x;
      // date current (is used to the loop)
      var dateCurrent = moment(dateStart);
      // dates for X axis
      var datesXAxis = [dateStart];
      // current step
      var currentStep = this.collection.options && this.collection.options.step
        ? this.collection.options.step
        : '1d';
      // Values to step
      var matchStep = /(\d+)(\w+)/g.exec(currentStep);
      // Defaults values to the step
      var stepValue = matchStep[1] || 1;
      var stepRange = matchStep[2] || 'd';
      var ranges = {
        d: 'days',
        h: 'hours',
        m: 'minutes'
      };

      // We fill (with dates) the period
      while (dateCurrent.isBefore(dateFinish)) {
        dateCurrent = dateCurrent.add(stepValue, ranges[stepRange]);
        datesXAxis.push(dateCurrent.toDate());
      }

      // chart DOM
      var chartRect = d3
        .select(this.$('.chart .nvd3 .nv-focus .nv-background rect')[0]);
      // chart width DOM
      var chartRectWidth = Number
        .parseInt(chartRect[0][0].getAttribute('width'), 10);
      // size label pixels put into the X axis
      var labelWidth = ranges[stepRange] === 'days'
        ? 62 //dates (59.34)
        : labelWidth = (ranges[stepRange] === 'hours' || ranges[stepRange] === 'minutes')
          && moment(dateFinish).diff(dateStart, 'days') >= 1
          ? 70 // dates + hours (67.17)
          : 32 // hours (29.77)
      // max tick to draw in X Axis
      var maxXTick = Number.parseInt((chartRectWidth - (labelWidth / 2)) / labelWidth, 10);
      // get multiples total dateXAxis
      var multiplesTotalXAxis = App.Utils.getMultipleNumbers(datesXAxis.length);

      // If there are more the 2 values
      // then we can search for the current multiple
      if (multiplesTotalXAxis.length > 2) {
        var newMaxTick = maxXTick;
        for (var i = 0; i < multiplesTotalXAxis.length; i++) {
          if (multiplesTotalXAxis[i] < maxXTick) {
            newMaxTick = multiplesTotalXAxis[i];
          }
        }
        // Only change the maXTick value is newMaxTick
        // is almost the half maXTick
        if (newMaxTick >= maxXTick / 2) {
          maxXTick = newMaxTick;
        }
      }

      // Difference between the data to draw
      var diff = Math.round(datesXAxis.length / maxXTick);

      // Fix some (particulary) errors
      if (datesXAxis.length > maxXTick && diff >= 1 && diff < 2) {
        diff += 1;
        maxXTick = Math.round(datesXAxis.length / diff);
      } else if (maxXTick > 14) {
        diff += 1;
        maxXTick = Math.round(datesXAxis.length / diff);
      }

      return diff < 1
        ? _.map(datesXAxis, function (item) {
          return item;
        })
        : _.reduce(datesXAxis, function (sumItems, item, index, originItems) {
          var currentIndex = Math.round(index * diff);
          if (sumItems.length < maxXTick && originItems[currentIndex]) {
            sumItems.push(originItems[currentIndex]);
          }
          return sumItems;
        }.bind(this), []);
    } else {
      return [];
    }
  },

  /**
   * Remove max and min value in X axis
   */
  hideMaxMinXAxis: function () {
    var axisChart =
      d3.selectAll(this.$('.chart .nvd3 .nv-focus .nv-axisMaxMin-x'));

    $(axisChart[0][0]).hide();
    $(axisChart[0][1]).hide();
  },

  /**
   * Remove any event
   */
  onClose: function () {
    this.stopListening();
  },

});
