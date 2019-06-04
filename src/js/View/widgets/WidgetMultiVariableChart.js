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
      sizeDiff: 'days',
      aggDefaultValues: []
    });
    this.options = {
      noAgg: options.noAgg || false
    };
    this._aggDefaultValues = this._multiVariableModel
      ? this._multiVariableModel.aggDefaultValues
      : [];

    if (this._stepModel) {
      this.collection.options.step = this._stepModel.get('step');
      this.listenTo(this._stepModel, 'change:step', function () {
        var regex = /\dd/;
        this._multiVariableModel.sizeDiff = regex.test(this._stepModel.get('step'))
          ? 'days'
          : 'hours';
        this.collection.fetch({ 'reset': true });
        this.render();
      });
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
    this.listenTo(this._ctx, 'change:start change:finish change:bbox', function () {

      // Fix the changes in models and collections (BaseModel & BaseCollections)
      if (this.collection
        && this.collection.options
        && typeof this.collection.options.data === 'string') {
        this.collection.options.data = JSON.parse(this.collection.options.data);
      }

      if (!this.collection.options.data) {
        this.collection.options.data = { time: {} }
      }
      this.collection.options.data.time.start = this._ctx.get('start');
      this.collection.options.data.time.finish = this._ctx.get('finish');

      App.Utils.checkBeforeFetching(this);

      // Launch request
      this.collection.fetch({ 'reset': true, data: this.collection.options.data || {} })
      // Render
      this.render();
    });

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

    this.collection.options.agg[realKey] = agg;

    currentAggs[realKey] = agg;
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
    this.collection.fetch({ 'reset': true, data: this.collection.options.data || {} })
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

    if (((disabledList[realKey] == undefined || disabledList[realKey] === false) &&
      this._internalData.elementsDisabled != tags - 1) || disabledList[realKey] === true) {
      $($($('.chart .nv-series')).get($(event.target).parent().attr('tag'))).click();
      $(event.target).parent().toggleClass('inactive');

      disabledList[realKey] = !disabledList[realKey];
      var $aggMenu = $(event.target).closest('div').find('a');

      if ($aggMenu.css('visibility') == 'hidden') {
        $aggMenu.css('visibility', 'visible');
      } else {
        $aggMenu.css('visibility', 'hidden');
      }

      this._internalData.elementsDisabled = disabledList[realKey]
        ? this._internalData.elementsDisabled + 1
        : this._internalData.elementsDisabled - 1;

      var variable = $(event.target).text();

      var model = this.data.findWhere({ key: variable });
      if (model != undefined) {
        model.set('disabled', !model.get('disabled'));
      }
      var model = this.collection.findWhere({ key: realKey });
      if (model != undefined) {
        model.set('disabled', !model.get('disabled'));
      }
      if (this.data.where({ 'disabled': false }).length == 1) {
        var json = this._getUniqueDataEnableToDraw();
        this.svgChart.datum(json).call(this.chart);
        this.svgChart.classed('normalized', false);
        this._drawYAxis();
      } else {
        this.svgChart.datum(this.data.toJSON()).call(this.chart)
        this.svgChart.classed('normalized', true)
      }
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
        this.data.find({ 'realKey': key }).set('disabled', true);
        this.collection.find({ 'key': key }).set('disabled', true);
      }
    }.bind(this));

    // Set 'normalized' CSS class
    if (this.data.where({ 'disabled': false }).length > 1) {
      d3.select(this.$('.chart')[0]).classed('normalized', true);
    } else {
      oneVarInMultiVar = true;
      d3.select(this.$('.chart')[0]).classed('normalized', false);
    }

    // Draw the chart with NVD3
    this.chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .margin({ 'right': 45 })
      .height(268)
      .noData(__('No hay datos disponibles'));

    // Without data (CSS)
    if (this.data.length === 0) {
      d3.select(this.$('.chart')[0]).classed('without-data', true);
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

    // Update chart (redraw)
    this.chart.update();
    // Update chart (redraw) when the window size changes
    nv.utils.windowResize(this.chart.update);

    // Draw the keys list behind the chart
    this.$('.var_list').html(
      this._list_variable_template({
        colors: App.getSensorVariableColorList(),
        data: this.data.toJSON(),
        currentAggs: this._internalData.currentAggs,
        disabledList: this._internalData.disabledList
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
            this.collection.findWhere({ 'key': c.realKey }).set('disabled', c.disabled);
          }
        } else {
          c.realKey = c.key;
          c.key = App.mv().getVariable(c.key).get('name');
          c.aggs = App.mv().getVariable(c.realKey).get('var_agg');

          // TODO - DELETE AFTER AQUASIG PILOT JULY 2019
          // Remove 'SUM' from variables (metadata)
          if (c.realKey.indexOf('aq_cons.sensor') > -1) {
            c.aggs.splice(c.aggs.indexOf('SUM'), 1);
          }
          // END TODO

          //Inicializacion de la estructura interna de datos
          var internalData = this._internalData;
          var meta = App.mv().getVariable(c.realKey);

          if (meta && meta.get('config') && meta.get('config').hasOwnProperty('default')) {
            internalData.disabledList[c.realKey] = !meta.get('config').default
          } else {
            internalData.disabledList[c.realKey] = false;
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
          return {
            x: v.x,
            y: (max - min) > 0
              ? (v.y - min) / (max - min)
              : 0, 'realY': v.y
          }
        });
      }.bind(this))
    );

    return parseData;
  },

  /**
   * Assure that the data (keys) are not replicated
   */
  _getUniqueDataEnableToDraw: function () {
    return _.map(this.collection.toJSON(), function (j) {
      j.key = this.data.findWhere({ 'realKey': j.key }).get('key');
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
      var finishDate = dataChart[0].values[dataChart[0].values.length -1].x;

      // Draw the X axis with values (date) with 'hours'
      // If the difference between dates is minus to two days
      this.chart
        .xAxis
        .tickFormat(function (d) {
          var localdate = moment.utc(d).local().toDate();

          // Same day
          if (moment(finishDate).isSame(moment(startDate), 'day')) {
            return d3.time.format('%H:%M')(localdate);
          } else if (this._multiVariableModel.sizeDiff === 'hours') {
            return d3.time.format('%d/%m - %H:%M')(localdate);
          }
          // Only date
          return d3.time.format('%d/%m/%Y')(localdate);

        }.bind(this))
        .tickValues(this.getXTickValues(dataChart));
    
      // Recalculate the items in X axis
      nv.utils.windowResize(function () {
        this.chart
          .xAxis
          .tickValues(this.getXTickValues(dataChart));
      }.bind(this));
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

      this.chart
        .yAxis
        .axisLabel(
          metadata.name +
          (metadata.units ? ' (' + metadata.units + ')' : '')
        );

      this.chart
        .yAxis
        .showMaxMin(false)
        .tickFormat(this._multiVariableModel.yAxisFunction
          ? this._multiVariableModel.yAxisFunction
          : format
        );
      this.svgChart.selectAll('.nv-focus .nv-y').call(this.chart.yAxis);
    }

    // Force y axis domain
    if (this._multiVariableModel.yAxisDomain && 
    this._multiVariableModel.yAxisDomain[realKey]) {
      this.chart.forceY(this._multiVariableModel.yAxisDomain[realKey]);
    }
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
      // chart DOM
      var chart = d3.select(this.$('.chart')[0]);
      // chart widgh DOM
      var chartWidth = $(chart[0]).width();
      // size in pixel to label to put into the X axis
      var labelWidth = 80;
      // max tick to draw in X Axis
      var maxXTick = Number.parseInt(chartWidth / labelWidth, 10);
      // Difference between the data to draw
      var diff = data[0].values.length / maxXTick;
      // Puede darse el caso de que haya periodos de tiempo 
      // entre fechas contiguas donde no existan datos, por lo que
      // la gráfica no dibuja puntos y la diferencia (diff) antes
      // obtenida no nos es válida para saber cuantos elementos caben
      // en el eje de las X
      if (diff > 1) {
        var rangeWithoutData = 0;

        if (data[0].values.length > 1) {
          _.each(data[0].values, function (date, index) {
            if (index > 0 &&
              moment(data[0].values[index].x)
                .diff(data[0].values[index-1].x, this._multiVariableModel.sizeDiff) >= diff) {
              rangeWithoutData++;
            }
          }.bind(this));
        }
        diff += rangeWithoutData;
      }

      return diff < 1
        ? _.map(data[0].values, function (item) {
          return item.x;
        })
        : _.reduce(data[0].values, function (sumItems, item, index, originItems) {
          var currentIndex = Number.parseInt(index * diff, 10);
          if (sumItems.length <= maxXTick) {
            if (index === 0 || (index + 1) === originItems.length) {
              // Initial and finish range
              sumItems.push(originItems[index].x);
            } else if (originItems[currentIndex]) {
              // If the difference the days is same the "diff"
              // between the values (this a solution when there
              // are range times without data)
              if (moment(originItems[currentIndex].x)
                .diff(sumItems[sumItems.length-1], this._multiVariableModel.sizeDiff) >= diff) {
                sumItems.push(originItems[currentIndex].x);
              }
            }
          }
          return sumItems;
        }.bind(this), []);
    } else {
      return [];
    }
  },

  /**
   * Remove any event
   */
  onClose: function () {
    this.stopListening();
  },

});
