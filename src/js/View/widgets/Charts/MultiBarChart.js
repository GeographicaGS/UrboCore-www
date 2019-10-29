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
 * NOTICE: Right now, this chart is focused on time related data, so the X axis data should be a date or a datetime.
 */
App.View.Widgets.Charts.MultiBarChart = App.View.Widgets.Charts.Bar.extend({
  _template: _.template($('#chart-base_context_chart').html()),

  events: _.extend({
    'click .popup_widget.step .varsel li': '_changeStep'
  }, App.View.Widgets.Charts.Bar.prototype.events),

  initialize: function (options) {
    if (!options.opts.has('multilineXLabel')) options.opts.set({ multilineXLabel: true });
    App.View.Widgets.Charts.Bar.prototype.initialize.call(this, options);
  },

  render: function () {
    this.options.set('stepsAvailable', App.Utils.getStepsAvailable());
    App.View.Widgets.Charts.Bar.prototype.render.call(this);
    return this;
  },

  _processData: function () {

    // stop processing data
    if (this.collection.toJSON().length === 0) {
      this.data = [];
      return;
    }

    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    var max = 0;
    var potMax = _.max(this.collection.toJSON(), function (c) {
      return c.data.length;
    });

    if (potMax.data) {
      max = potMax.data.length;
    }

    this.data = [];

    var _this = this;
    var timeFormatter = d3.time.format.iso;

    for (var i = 0; i < max; i++) {
      this.data.push({ 'values': [] });
      _.each(this.collection.toJSON(), function (elem) {
        var value = 0;

        if (i < elem.data.length) {
          var key = Object.keys(elem.data[i])[0];
          value = elem.data[i][key];
          key += i.toString()
        }

        if (_this.data[i]['key'] === undefined) {
          _this.data[i]['key'] = _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key)
            ? _this.options.get('legendNameFunc')(key)
            : key;
        }
        _this.data[i]['realKey'] = key;
        _this.data[i]['values'].push({
          x: timeFormatter.parse(elem.time),
          y: parseFloat(value)
        });
      });
    }
  },

  _initChartModel: function () {
    this._chart = nv.models.multiBarChart()
      .showControls(false)
      .showLegend(!this.options.get('hideLegend'))
      .stacked(this.options.get('stacked'))
      .groupSpacing(.5)
      .color(this._colors)
      .margin({ 'bottom': 15 })
      .height(270)
      .noData(this.options.get('noDataMessage'));

    this._chart.yAxis.tickPadding(10);

    // Custom callback function (afterRender)
    this._chart.dispatch.on('renderEnd', function () {
      if (typeof this.options.get('afterRenderChart') === 'function') {
        this.options.get('afterRenderChart').apply(this);
      }
    }.bind(this));
  },

  _formatXAxis: function () {
    // Fix the changes in models and collections (BaseModel & BaseCollections)
    if (this.collection
      && this.collection.options
      && typeof this.collection.options.data === 'string') {
      this.collection.options.data = JSON.parse(this.collection.options.data);
    }

    var labelWidth = 70; //pixels
    var container = d3.select(this.$('.chart')[0]);
    var containerWidth = (this._chart.width() || parseInt(container.style('width')) || 960)
      - (this._chart.margin().left + this._chart.margin().right);
    var startDate = this.data[0].values[0].x;
    var finishDate = this.data[0].values[this.data[0].values.length - 1].x;
    var numElems = this.data[0] && this.data[0].values
      ? this.data[0].values.length
      : 1;
    var barWidth = (1 - this._chart.groupSpacing()) * containerWidth / numElems;
    // Operations to set the values to X axis
    var valueXAxis = _.reduce(this.data[0].values, function (sumValues, value) {
      sumValues.push(value.x);
      return sumValues;
    }, []);
    var maxTicks = Number.parseInt((containerWidth - (labelWidth / 2)) / labelWidth, 10);
    var diffTicks = maxTicks > 0
      ? Math.ceil(numElems / maxTicks)
      : 1;

    // Set new values to X Axis
    if (maxTicks < numElems) {
      valueXAxis = _.reduce(this.data[0].values, function (sumValues, value, key) {
        if (key % diffTicks === 0) {
          sumValues.push(value.x);
        }
        return sumValues;
      }, []);
    }

    // Scale to the bands (columns)
    this._xScale = d3.time.scale();
    this._xScale.rangeBands = this._xScale.range;
    this._xScale.rangeBand = function () {
      return Math.max(barWidth, 2);
    }.bind(this);
    this._chart.multibar.xScale(this._xScale);

    // set Scale in X Axis
    this._chart
      .xDomain([startDate, finishDate])
      .xRange([0, containerWidth - barWidth]);

    // We decide which values show in X Axis
    this._chart.xAxis
      .tickValues(valueXAxis)
      .tickPadding(5)
      .tickFormat(this.xAxisFunction)
      .axisLabel(this.options.get('xAxisLabel'));
  },

  _adjustXAxis: function () {
    this._chart.update();

    if (this.data.length > 0) {
      var width = this._chart.xAxis.rangeBand();
      var ticks = d3.select(this.$('.nv-x')[0]).selectAll('.tick text,.tick foreignObject');

      ticks.each(function (d) {
        this.insertLinebreaks(this, d, width);
      }.bind(this));

      // Move labels in X axis
      setTimeout(function () {
        this.moveLabelXAxis(width);
      }.bind(this), 500);
    }
  },

  insertLinebreaks: function (t, d, width) {
    var txt = this.xAxisFunction ? this.xAxisFunction(d) : d;
    var el = d3.select(t);
    var p = d3.select(t.parentNode);

    if (txt.length > 4) {
      width = txt.length * 6; // 6px size letter
    }

    p.append('foreignObject')
      .attr('width', width)
      .attr('height', 200)
      .append('xhtml:p')
      .attr('style', 'white-space: wrap; text-align:center;')
      .html(this.xAxisFunction ? this.xAxisFunction(d) : d);

    el.remove();
  },

  /**
   * Move label x axis to adjust with the center of bar
   * 
   * @param {Number} width - with bar
   */
  moveLabelXAxis: function (width) {
    d3.select(this.$('.nv-x')[0])
      .selectAll('.tick')
      .each(function (d) {
        var positionXTick = Number.parseFloat(
          this.getAttribute('transform')
          .split(',')
          .shift()
          .replace('translate(', '')
        );
        var movePx = positionXTick + Number.parseFloat(width/2);
        this.setAttribute('transform', 'translate(' + movePx + ',0)');
      });
  }
});
