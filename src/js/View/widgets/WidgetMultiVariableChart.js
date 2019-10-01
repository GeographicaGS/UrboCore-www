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
App.View.Widgets.MultiVariableChart = Backbone.View.extend({

  // Templates
  viewTemplate: _.template($('#widgets-widget_multiVariable_chart').html()),
  popupTemplate: _.template($('#chart-base_charttooltip').html()),
  listVariablesTemplate: _.template($('#widgets-widget_multiVariable_list_variables').html()),

  // Own params
  _stepModel: null,
  _ctx: null, // This is used in "checkStepsAvailable"
  aggDefault: {},
  chart: null,
  chartBehaviourData: {
    currentAggs: {},
    disabledList: {},
    elementsDisabled: 0
  },
  chartDOM: null,
  collection: null,
  mvModel: {
    afterRenderChart: null,
    aggDefaultValues: [],
    className: null,
    colorsFn: null,
    customNoDataMessage: __('No hay datos disponibles'),
    disabledList: [],
    forceStep: null,
    hideStepSelector: false,
    hideVarList: false,
    normalized: true,
    sizeDiff: 'days',
    timeMode: 'date',
    yAxis1Domain: null,
    yAxis2Domain: null,
    yAxis1LabelDefault: null,
    yAxis2LabelDefault: null,
    yAxis1TickFormat: null,
    yAxis2TickFormat: null,
    yAxis1TicksNumber: null,
    yAxis2TicksNumber: null,
  },
  parseData: null,
  options: {},
  requestLock: false, // Block any request when one request is working

  events: {
    'click .nv-series': '_redrawSeries',
    'click .popup_widget.agg li': 'onChangeAgg',
    'click .popup_widget.step li': 'onChangeStep',
    'click .btnLegend .text.first': 'onClickLegend',
    'click .popup_widget.agg': function (e) {
      e.stopPropagation();
    }
  },

  initialize: function (options) {
    // Set the options
    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this.mvModel = _.defaults(options.multiVariableModel.toJSON() || {}, this.mvModel);
    this.options = _.defaults(options || {}, {
      noAgg: false
    });
    this.aggDefault = this.mvModel
      ? this.mvModel.aggDefaultValues
      : [];

    this.collection.options.agg = this.aggDefault
      ? this.aggDefault
      : this.collection.options.agg;

    // Initial disabledList
    if (this.mvModel.disabledList && this.mvModel.disabledList.length > 0) {
      _.each(this.mvModel.disabledList, function (element) {
        this.chartBehaviourData.disabledList[element] = true;
        this.chartBehaviourData.elementsDisabled ++;
      }.bind(this));
    }

    // This is used in "checkStepsAvailable"
    this._ctx = App.ctx;

    // Events
    this.setupEvents();

    // Launch request the first time
    this.collection.fetch({
      reset: true,
      data: this.collection.options.data || {}
    });

    // Render chart
    this.render();
  },

  /**
   * Setup view events
   */
  setupEvents: function () {
    // when collection data does "reset"
    this.listenTo(this.collection, 'reset', this.drawChart);

    // When the user change some parameters from "context"
    this.listenTo(App.ctx, 'change:start change:finish change:bbox',
      function () {
        if (!this.requestLock) {
          // Block the rest of requests
          this.requestLock = true;

          // Fix the changes in models and collections (BaseModel & BaseCollections)
          if (this.collection
            && this.collection.options
            && typeof this.collection.options.data === 'string') {
            this.collection.options.data = JSON.parse(this.collection.options.data);
          }

          if (!this.collection.options.data) {
            this.collection.options.data = { time: {} }
          }
          // Set time
          this.collection.options.data.time = App.ctx.getDateRange();

          // Set update step
          var currentStep = null;

          if (this.mvModel.forceStep !== null) { // force step
            currentStep = this.mvModel.forceStep;
            this._stepModel.set('step', currentStep);
          } else {
            App.Utils.checkBeforeFetching(this);
            currentStep = this._stepModel && this._stepModel.has('step')
              ? this._stepModel.get('step')
              : this.collection.options &&
                this.collection.options.data &&
                this.collection.options.data.step
                ? this.collection.options.data.step
                : this.collection.options.step || '1d';  
          }

          var regex = /\dd/;
          this.mvModel.sizeDiff = regex.test(currentStep)
            ? 'days'
            : 'hours';

          this.collection.options.data.time.step = currentStep;

          // Launch request
          this.collection.fetch({
            reset: true,
            data: this.collection.options.data || {},
            success: function () {
              var response = arguments[1] || [];

              // parse response
              if (typeof this.collection.parse === 'function') {
                response = this.collection.parse(response);
              }

              // Unblock the rest of requests
              this.requestLock = false;
            }.bind(this)
          });
          // Render
          this.render();
        }
      }.bind(this));

    // When the user change the chart "step"
    if (this._stepModel) {
      this.collection.options.step = this._stepModel.get('step');
      this.listenTo(this._stepModel, 'change:step',
        function () {
          if (!this.requestLock) {
            var regex = /\dd/;

            this.mvModel.sizeDiff = regex.test(this._stepModel.get('step'))
              ? 'days'
              : 'hours';
            this.collection.fetch({
              reset: true,
            });

            this.render();
          }
        }.bind(this));
    }
  },

  /**
   * When we click on the agreggation selector
   *
   * @param {*} e - triggered event
   */
  onChangeAgg: function (e) {
    e.preventDefault();

    var $ulCurrentElement = $(e.currentTarget).closest('ul');
    var realKey = $ulCurrentElement.attr('data-id');
    var agg = $(e.currentTarget).attr('data-agg');

    this.chartBehaviourData.currentAggs[realKey] = agg;
    // It works with the collection "DeviceTimeSerieChart"
    this.collection.options.agg[realKey] = agg;
    // It works with the collection "TimeSeries"
    if (!this.collection.options.data) {
      this.collection.options.data = {};
    }
    this.collection.options.data.agg = [];
    _.each(this.collection.options.vars, function (value) {
      this.collection.options.data.agg
        .push(this.chartBehaviourData.currentAggs[value]);
    }.bind(this));

    this.collection.fetch({
      reset: true,
      data: this.collection.options.data || {}
    });

    this.render();
  },

  /**
   * When we click on the step selector
   *
   * @param {*} e - triggered event
   */
  onChangeStep: function (e) {
    e.preventDefault();

    var step = $(e.currentTarget).attr('data-step');
    var data = typeof this.collection.options.data === 'string'
      ? JSON.parse(this.collection.options.data)
      : this.collection.options.data;

    this.collection.options.step = step;
    this._stepModel.set('step', step);
    if (data.time) {
      data.time.step = step;
    }

    this.collection.fetch({
      reset: true,
      data: data || {}
    });

    this.render();
  },

  /**
   * When we click on a label (key) to show or hide
   * the associated values
   *
   * @param {*} event - triggered event
   */
  onClickLegend: function (event) {
    var tags = this.$('.btnLegend').size();
    var realKey = $(event.target).closest('div').attr('id');
    var disabledList = this.chartBehaviourData.disabledList;
    var variable = $(event.target).data('key').toString();

    if (((typeof disabledList[realKey] === 'undefined' || disabledList[realKey] === false) &&
      this.chartBehaviourData.elementsDisabled !== tags - 1) || disabledList[realKey] === true) {
      $($($('.chart .nv-series')).get($(event.target).parent().attr('tag'))).click();
      $(event.target).parent().toggleClass('inactive');

      disabledList[realKey] = !disabledList[realKey];
      var $aggMenu = $(event.target).closest('div').find('a');

      if ($aggMenu.css('visibility') === 'hidden') {
        $aggMenu.css('visibility', 'visible');
      } else {
        $aggMenu.css('visibility', 'hidden');
      }

      this.chartBehaviourData.elementsDisabled = disabledList[realKey]
        ? this.chartBehaviourData.elementsDisabled + 1
        : this.chartBehaviourData.elementsDisabled - 1;

      // Change attribute "disabled"
      var dataVariable = this.parseData.findWhere({ key: variable });
      var collectionVariable = this.collection.findWhere({ key: realKey });

      if (typeof dataVariable !== 'undefined') {
        dataVariable.set('disabled', !dataVariable.get('disabled'));
      }

      if (typeof collectionVariable !== 'undefined') {
        collectionVariable.set('disabled', !collectionVariable.get('disabled'));
      }

      var chartData = this.parseData.where({ 'disabled': false }).length === 1
        ? this.getEnabledDataToCollection.apply(this)
        : this.parseData.toJSON();

      // Put the new data in chart
      this.chartDOM
        .datum(chartData)
        .transition()
        .each('start', function () {
          // update the chart after the data are updating
          this.chart.update();
        }.bind(this))
        .duration(250)
        .call(this.chart);

      // Custom callback function
      if (typeof this.mvModel.afterRenderChart === 'function') {
        this.mvModel.afterRenderChart.apply(this);
      }

      // Re-draw Y Axis or Thresholds
      this.updateYAxis();
    }
  },

  /**
   * Draw DOM elements
   */
  render: function () {
    this.$el.html(this.viewTemplate({
      s: this._stepModel
        ? this._stepModel.toJSON()
        : null,
      m: this.mvModel || null,
      stepsAvailable: this._stepsAvailable
    }));

    this.$('.widget')
      .append(App.widgetLoading());

    return this;
  },

  /**
   * Draw Chart
   */
  drawChart: function () {
    nv.addGraph({
      // First generate the chart
      generate: function () {

        // get parse data
        this.parseData = this.parseDataCollectionToChart();

        // get initial step
        App.Utils.initStepData(this);

        // Hide the loading
        this.$('.loading.widgetL').addClass('hiden');

        // Set some CSS
        d3.select(this.$('svg.chart')[0])
          .classed('without-data', this.parseData.length === 0);

        // Draw the chart with NVD3
        this.chart = nv.models.multiChart()
          .useInteractiveGuideline(true)
          .margin({ right: 45 })
          .height(268)
          .noData(this.mvModel.customNoDataMessage)
          .showLegend(false);

        // Añadimos datos a la gráfica
        this.chartDOM = d3.select(this.$('svg.chart')[0])
          .datum(this.parseData.where({ disabled: false }).length === 1
            ? this.getEnabledDataToCollection()
            : this.parseData.toJSON()
          )
          .call(this.chart);

        // Update chart (redraw) when the window size changes
        nv.utils.windowResize(this.chart.update);

      }.bind(this),
      // After the function "generate", function "callback" is launched
      callback: function () {
        // Generamos el tooltip personalizado para la gráfica
        this.setupToolTip();

        // Colocamos nuestra leyenda personalizada
        if (this.mvModel.hideVarList === false) {
          this.$('.var_list').html(
            this.listVariablesTemplate({
              colors: this.mvModel.colorsFn || App.getSensorVariableColorList(),
              currentAggs: this.chartBehaviourData.currentAggs,
              data: this.parseData.toJSON(),
              disabledList: this.chartBehaviourData.disabledList,
              noAgg: this.options.noAgg
            })
          );
        }

        // Dibujamos el eje X
        this.setupXAxis();

        // Dibujamos el eje Y
        this.updateYAxis();

        // Custom callback function
        if (typeof this.mvModel.afterRenderChart === 'function') {
          this.mvModel.afterRenderChart.apply(this);
        }

      }.bind(this)
    });
  },

  /**
   * Update chart Y Axis
   */
  updateYAxis: function () {
    // Dibujamos el eje Y (1)
    if (this.mvModel.yAxisThresholds) {
      this.setupThresholdsYAxis1();
    } else {
      this.setupYAxis1();
    }

    // Dibujamos el eje Y (2)
    this.setupYAxis2();

    // Update chart (with the last changes)
    this.chart.update();

    if (this.mvModel.yAxisThresholds) {
      this.removeTickYAxis1();
    }
  },

  /**
   * Prepare the attribute "data" to the chart
   *
   * @return {Array} - parse data
   */
  parseDataCollectionToChart: function () {
    //Por si el servidor devuelve series con valores a nulos
    _.each(this.collection.where(
      function (model) {
        return model.get('values').length === 0;
      }),
      function (m) {
        this.collection.remove(m);
      }.bind(this)
    );

    // Aqui se hacen varias cosas
    // 1. Establecemos algunos parámetros por si estos no vienen en el array de datos
    // 2. Completamos el objeto "chartBehaviourData"
    _.each(this.collection.models, function (model) {
      // metadata
      var meta = App.mv().getVariable(model.key);
      var types = ['area', 'line', 'scatter', 'bar'];
      // Default type = "lines"
      if (!model.has('type') || types.indexOf(model.get('type')) === -1) {
        model.set('type', 'line');
      }
      // Default type = "lines"
      if (!model.has('yAxis')) {
        model.set('yAxis', 1);
      }
      // Default disabled = false
      if (!model.has('disabled')) {
        model.set('disabled', false);
      }

      // Set "disabled" attribute
      if (model.has('key')) {
        model.set('disabled', this.chartBehaviourData.disabledList[model.get('key')] || false);
      }

      // Set 'aggs' variable
      if (!model.has('aggs') && !this.options.noAgg) {
        model.set('aggs', this.getAggregationsVariable(model.get('key')));
      }

      // Almacenamos en "chartBehaviourData" el estado "disabled"
      if (typeof this.chartBehaviourData.disabledList[model.key] === 'undefined') {
        if (meta && meta.get('config') && meta.get('config').hasOwnProperty('default')) {
          this.chartBehaviourData.disabledList[model.key] = !meta.get('config').default
        } else {
          this.chartBehaviourData.disabledList[model.key] = false;
        }
      }

      // Almacenamos las opciones de "agregación" correctamente en la colección
      // y en el objeto "chartBehaviourData" (solo la primera vez)
      if (!this.options.noAgg) {
        var currentDefaultAgg = !_.isEmpty(this.aggDefault)
          ? this.aggDefault[model.get('key')]
          : null;

        if ((Array.isArray(model.get('aggs')) && model.get('aggs').length && !model.get('aggs').includes('NOAGG'))
          && (_.isEmpty(this.aggDefault) || (currentDefaultAgg !== 'NONE'))) {
          if (typeof currentDefaultAgg === undefined || !_.contains(model.get('aggs'), currentDefaultAgg.toUpperCase())) {
            currentDefaultAgg = model.get('aggs').length > 0
              ? model.get('aggs')[0]
              : this.aggDefault[model.realKey] || null;
            model.set('currentAgg', currentDefaultAgg);
            this.collection.options.agg[model.get('key')] = currentDefaultAgg;
            this.chartBehaviourData.currentAggs[model.get('key')] = currentDefaultAgg;
          } else {
            model.set('currentAgg', currentDefaultAgg);
            this.collection.options.agg[model.get('key')] = currentDefaultAgg;
            this.chartBehaviourData.currentAggs[model.get('key')] = currentDefaultAgg;
          }
        }
      }
    }.bind(this));

    // Parseamos los datos (normalizamos si es necesario) de la colección inicial
    return new Backbone.Collection(
      _.map(this.collection.toJSON(), function (model) {
        var meta = App.mv().getVariable(model.key);
        // Set attributes to object
        model.realKey = model.key;
        if (meta && meta.has('name')) {
          model.key = meta.get('name');
        }
        model.values = this.getNormalizedData(model.values, model.realKey);
        if (!model.color && this.mvModel.colorsFn) {
          model.color = this.mvModel.colorsFn(model.realKey)
        }
        return model;

      }.bind(this), [])
    );
  },

  /**
   * Get the normalized data to
   *
   * @param {Array} values - model values
   * @param {String} key - model key
   * @return {Array} normalized data
   */
  getNormalizedData: function (values, key) {
    var min = 0;
    var max = 1;

    // Get max and min values, these values depends of any
    // options like "thresholds" and "domains"
    if (this.mvModel.yAxisThresholds) {
      min = this.mvModel.yAxisThresholds[0].startValue;
      max = this.mvModel
        .yAxisThresholds[this.mvModel.yAxisThresholds.length - 1].endValue;
    } else if (this.mvModel.yAxis1Domain &&
      this.mvModel.yAxis1Domain[key] !== undefined) {
      min = this.mvModel.yAxis1Domain[key][0];
      max = this.mvModel.yAxis1Domain[key][1];
    } else {
      min = _.min(values, function (v) { return v.y; }).y;
      max = _.max(values, function (v) { return v.y; }).y;
    }

    // Normalization the charts, we save the original
    // "Y" value in the attribute "realY"
    return _.map(values, function (v) {
      // Aseguro que el valor "Y" es numérico
      v.y = parseFloat(d3.format('.4f')(v.y));
      var valueY = v.y;

      // Solo normalizo si no existen límites
      if (this.mvModel.normalized
        && !this.mvModel.yAxisThresholds) {
        valueY = (max - min) > 0
          ? (v.y - min) / (max - min)
          : 0;
      }

      return {
        x: v.x,
        y: valueY,
        realY: v.y
      }
    }.bind(this));
  },

  /**
   * Assure that the data (keys) are not replicated
   */
  getEnabledDataToCollection: function () {
    return _.map(this.collection.toJSON(), function (j) {
      j.realKey = j.key;
      j.key = this.parseData.findWhere({ 'realKey': j.key }).get('key');

      if (this.mvModel.colorsFn) {
        j.color = this.mvModel.colorsFn(j.realKey)
      }
      return j;
    }.bind(this));
  },

  /**
   * Get the aggregations variable
   *
   * @return {Array} aggregation
   */
  getAggregationsVariable: function (variable) {
    var orderAggregations = ['SUM', 'MAX', 'AVG', 'MIN'];
    var currentAggregations = App.mv().getVariable(variable).get('var_agg');

    return _.filter(orderAggregations, function (orderAgg) {
      if (_.find(currentAggregations, function (currentAgg) {
        return orderAgg === currentAgg;
      })) {
        return true;
      }
      return false;
    });
  },

  /**
   * Draw the X values in the chart
   */
  setupXAxis: function () {
    if (this.chart && this.parseData.length) {
      var dataChart = this.parseData.toJSON();
      var startDate = dataChart[0].values[0].x;
      var finishDate = dataChart[0].values[dataChart[0].values.length - 1].x;
      var fnRemoveMaxMinXAxis = _.debounce(_.bind(this.removeMaxMinXAxis, this), 350);

      // Draw the X axis with values (date) with 'hours'
      // If the difference between dates is minus to two days
      this.chart
        .xAxis
        .tickPadding(15)
        .showMaxMin(false)
        .tickFormat(function (d) {
          var localdate = moment.utc(d).local().toDate();

          // Same day
          if (moment(finishDate).isSame(moment(startDate), 'day')) {
            return d3.time.format('%H:%M')(localdate);
          } else if ((this.mvModel.sizeDiff === 'hours'
            || this.mvModel.sizeDiff === 'minutes')
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
          .tickPadding(15)
          .showMaxMin(false)
          .tickValues(this.getXTickValues(dataChart));
        // Remove max and min
        fnRemoveMaxMinXAxis();

      }.bind(this));
      // Remove max and min
      fnRemoveMaxMinXAxis();
    }
  },

  /**
   * Draw the Y values in the chart
   */
  setupYAxis1: function () {
    // variables to show in chart
    var variablesEnabled = this.parseData.where({
      disabled: false
    });
    // format function to tick values
    var fnYAxis1TickFormat = typeof this.mvModel.yAxis1TickFormat === 'function'
      ? this.mvModel.yAxis1TickFormat
      : App.nbf;

    // unique enabled variable in the normalized chart
    if (variablesEnabled.length === 1 && this.mvModel.normalized) {
      var currentVariableEnabled = variablesEnabled[0];
      var realKey = currentVariableEnabled.get('realKey');
      var values = currentVariableEnabled.get('values');
      var metadata = App.Utils.toDeepJSON(
        App.mv().getVariable(realKey)
      );

      if (typeof this.mvModel.yAxis1TickFormat !== 'function') {
        fnYAxis1TickFormat = _.some(values, function (currentValue) {
          return currentValue.realY < 1;
        })
          ? App.d3Format.numberFormat(',.3r')
          : App.nbf;
      }

      fnYAxis1TickFormat = typeof this.mvModel.yAxis1TickFormat === 'function'
        ? this.mvModel.yAxis1TickFormat
        : _.some(values, function (currentValue) {
          return currentValue.realY < 1;
        })
          ? App.d3Format.numberFormat(',.3r')
          : App.nbf;

      // Put the label and values
      // in Y Axis 1
      this.chart
        .yAxis1
        .axisLabel(
          metadata.name +
          (metadata.units ? ' (' + metadata.units + ')' : '')
        )
        .tickFormat(fnYAxis1TickFormat);

    } else if (this.mvModel.normalized) { // various enabled variables in the normalized chart
      // Put the label and values
      // in Y Axis 1
      this.chart
        .yAxis1
        .axisLabel(this.mvModel.yAxis1LabelDefault || '')
        .axisLabelDistance(-10)
        .tickFormat(function () {
          return '';
        });
    } else { // various enabled variables in the "NO" normalized chart
      // Put the label and values
      // in Y Axis 1
      this.chart
        .yAxis1
        .axisLabel(this.mvModel.yAxis1LabelDefault || '')
        .axisLabelDistance(-10)
        .tickFormat(fnYAxis1TickFormat);
    }

    // Change number ticks in YAxis1
    if (this.mvModel.yAxis1TicksNumber) {
      this.chart
        .yAxis1
        .ticks(this.mvModel.yAxis1TicksNumber);
    }

    // Change domain in YAxis1
    if (realKey &&
      this.mvModel.yAxis1Domain &&
      this.mvModel.yAxis1Domain[realKey]) {
      this.chart.yDomain1(this.mvModel.yAxis1Domain[realKey]);
    } else if (this.mvModel.yAxis1Domain) {
      this.chart.yDomain1(this.mvModel.yAxis1Domain);
    }
  },

  /**
   * Draw the Y values in the chart
   */
  setupYAxis2: function () {
    // format function to tick values
    var fnYAxis2TickFormat = typeof this.mvModel.yAxis2TickFormat === 'function'
      ? this.mvModel.yAxis2TickFormat
      : App.nbf;

    // Put the label and values
    // in Y Axis 2
    this.chart
      .yAxis2
      .axisLabel(this.mvModel.yAxis2LabelDefault || '')
      .axisLabelDistance(-25)
      .tickFormat(fnYAxis2TickFormat);
  },


  /**
   * Draw limits (horizontal lines) in the chart
   */
  setupThresholdsYAxis1: function () {
    // Current domain to YAxis1
    var currentDomain = [
      this.mvModel.yAxisThresholds[0].startValue,
      this.mvModel
        .yAxisThresholds[this.mvModel.yAxisThresholds.length - 1].endValue
    ];
    var wrapperY = d3.select(this.$('.chart > .nvd3 > g .nv-axis.nv-y1')[0])
      .node();

    // Remove ticks from Y Axis 1
    setTimeout(function () {
      this.removeTickYAxis1();
    }.bind(this), 250);

    // If we don't get the wrapper dimensions
    if (!wrapperY) {
      return;
    }

    // Wrapper dimensions
    var wrapRect = wrapperY.getBBox();

    // If we don't get the wrapper dimensions
    if (wrapRect.width === 0) {
      return;
    }

    // In "multiChart" there isn't "yScale"
    // we create the function to scale Y axis
    var fnYScale = function () {
      return d3.scale.linear()
        .domain(currentDomain)
        .range([Number.parseInt(wrapRect.height + wrapRect.y, 10), 0])
        .clamp(true);
    }

    // Force domain en yAxis1
    this.chart.yDomain1(currentDomain);

    // If the "th-groups" already are created, we stop here
    if (!d3.selectAll(this.$('.chart > .nvd3 > g .th-groups')).empty()) {
      return;
    }

    // Add wrapper to all content
    var chartContent = d3.select(this.$('.chart > .nvd3 > g')[0]);
    var g = chartContent
      .append('g')
      .attr({
        class: 'th-groups'
      });

    // Draw each thresholds line and rect
    _.each(this.mvModel.yAxisThresholds, function (threshold) {
      var thresholdGroup = g.append('g').attr({
        class: 'thresholdGroup'
      });
      var thHeight = fnYScale.apply(this)(threshold.startValue) - fnYScale.apply(this)(threshold.endValue);
      var thWidth = wrapRect.width + wrapRect.x;

      thresholdGroup.append('line')
        .attr('class', 'thresholds')
        .attr({
          x1: 0,
          x2: thWidth,
          y1: fnYScale.apply(this)(threshold.startValue),
          y2: fnYScale.apply(this)(threshold.startValue),
          'stroke-dasharray': 4,
          stroke: threshold.color
        });

      thresholdGroup.append('rect')
        .attr('class', 'thresholds')
        .attr({
          x: 0,
          y: fnYScale.apply(this)(threshold.endValue),
          width: thWidth,
          height: thHeight,
          fill: threshold.color,
          'fill-opacity': 0.1
        });

      thresholdGroup.append('text')
        .text(__(threshold.realName))
        .attr('class', 'axis-label')
        .attr('x', 10)
        .attr('y', fnYScale.apply(this)(threshold.endValue) + thHeight / 2)
        .attr('dy', '.32em')
        .attr('width', thWidth)
        .attr('height', thHeight / 2)
        .attr('class', 'thresholdLabel');

      thresholdGroup.append('text')
        .text(__(threshold.endValue))
        .attr('class', 'axis-label')
        .attr('x', -20)
        .attr('y', fnYScale.apply(this)(threshold.endValue))
        .attr('dy', '.32em')
        .attr('width', thWidth)
        .attr('class', 'thresholdValue');

    }.bind(this));

    // When the windows is resized
    nv.utils.windowResize(function () {
      this.setupThresholdsYAxis1();
    }.bind(this));

  },

  /**
   * Set tooltip when we do "hover" the chart (points)
   */
  setupToolTip: function () {
    if (this.chart) {
      this.chart
        .interactiveLayer
        .tooltip
        .contentGenerator(function (data) {
          // Each value to tooltip
          _.each(data.series, function (s) {
            var currentKey = s.key
              .replace(' (right axis)', '');
            var model = this.parseData.findWhere({ key: currentKey });

            // set some attributes
            if (model) {
              var currentValue = _.find(model.get('values'), function (v) {
                return v.x.toString() == data.value.toString();
              });

              if (currentValue) {
                s.value = currentValue.realY;
              }

              if (model.has('label')) {
                s.key = model.get('label');
              }

              if (model.has('realKey')) {
                s.realKey = model.get('realKey');
              }

              if (model.has('classed')) {
                s.classed = model.get('classed');
              }
            }

            // Change value in tooltip
            if (this.mvModel.toolTipValueFunction) {
              s.value = typeof this.mvModel.toolTipValueFunction === 'function'
                ? this.mvModel.toolTipValueFunction(s.realKey, s.value)
                : s.value;
            }

          }.bind(this));

          return this.popupTemplate({
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

      // chartContent
      var chartContent = d3.select(this.$('.chart .wrap .nv-axis.nv-y1')).node();

      if (typeof chartContent[0] === 'undefined') {
        return; // get out of here
      }

      // chartContent dimensions
      var chartContentRect = chartContent[0].getBBox();
      // size label pixels put into the X axis
      var labelWidth = ranges[stepRange] === 'days'
        ? 62 //dates (59.34)
        : labelWidth = (ranges[stepRange] === 'hours' || ranges[stepRange] === 'minutes')
          && moment(dateFinish).diff(dateStart, 'days') >= 1
          ? 70 // dates + hours (67.17)
          : 32 // hours (29.77)
      // max tick to draw in X Axis
      var maxXTick = Number.parseInt((chartContentRect.width - (labelWidth / 2)) / labelWidth, 10);
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
  removeMaxMinXAxis: function () {
    d3.selectAll(this.$('.chart .wrap .nv-x .nv-axis .nv-axisMaxMin-x'))
      .remove();
  },

  /**
   * Remove "tick" from yAxis1
   */
  removeTickYAxis1: function () {
    d3.selectAll(this.$('.chart > .nvd3 > g .nv-y1 g.tick:not(.zero)'))
      .remove();
  },

  /**
   * Check if the current scope has permissions about
   * entities or attributes to show into the widget
   *
   * @return {Boolean} ¿has permissions?
   */
  hasPermissions: function () {
    if (this.options && this.options.permissions) {
      return App.mv().validateInMetadata(this.options.permissions);
    }

    return true;
  },

  /**
   * Remove any event
   */
  close: function () {
    this.stopListening();
  },

});
