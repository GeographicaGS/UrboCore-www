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

App.View.Widgets.Charts.Scatter = App.View.Widgets.Charts.Base.extend({
  initialize: function (options) {
    if (!options.opts.has('percentMode'))
      options.opts.set({ percentMode: false });
    App.View.Widgets.Charts.Base.prototype.initialize.call(this, options);
    _.bindAll(this, "_drawChart");
  },

  _processData: function () {
    this.data = [];
    var _this = this;

    _.each(this.collection.toJSON(), function (c, index) {
      for (var key in c) {
        var item = {
          realKey: key,
          key: _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key)
            ? _this.options.get('legendNameFunc')(key)
            : key,
          values: c[key]
        };
        _this.data.push(item);
      }
    });
  },

  _initChartModel: function () {
    this._chart = nv.models.scatterChart()
      .margin({ 'right': 30 })
      .height(300)
      .pointSize(64)
      .pointRange([64, 64])
      // .useVoronoi(false)
      .noData(__('No hay datos disponibles'))
      .color(this.options.get('colors'))
      ;

    this._chart.yAxis.tickPadding(10);

    if (this.options.get('percentMode')) {
      this._chart.forceY([0, 100]);
    }
  },

  _formatXAxis: function () {
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin') : true)
      .tickFormat(this.options.get('xAxisFunction'));

    if (this.data.length > 1 &&
      this.data[0].values &&
      this.data[0].values.length &&
      this.data[1].values &&
      this.data[1].values.length) {

      var start = null;
      var finish = null;

      // Values X axis
      if (this.options.has('xAxisDomain')) {
        start = this.options.get('xAxisDomain')[0];
        finish = this.options.get('xAxisDomain')[1];
      } else if (typeof this.data[0].values[0].x === 'number') {
        var allValuesX = _.reduce(this.data, function (sumVariables, variable) {
          var valuesX = _.reduce(variable.values, function (sumValues, value) {
            sumValues.push(value.x);
            return sumValues;
          }, []);

          sumVariables.push.apply(sumVariables, valuesX);
          
          return sumVariables;
        }, []);
        
        var start = Math.min.apply(Math, allValuesX);
        var finish = Math.max.apply(Math, allValuesX);
      }

      // Set the total elements to fit in X axis
      var diffFinishStart = finish - start;
      var wrapperWidth = d3.select('svg.chart .nv-axis.nv-x') &&
        d3.select('svg.chart .nv-axis.nv-x').node() &&
        d3.select('svg.chart .nv-axis.nv-x').node().getBBox()
        ? d3.select('svg.chart .nv-axis.nv-x').node().getBBox().width
        : null;
      var labelWidth = 75; //pixels
      var totalLabels = wrapperWidth
        ? Number.parseInt(wrapperWidth / labelWidth, 10)
        : null;
      var diff = totalLabels
        ? Number.parseInt((diffFinishStart) / totalLabels, 10)
        : 48;

      this._chart.xAxis
        .domain([start, finish])
        .tickValues(_.range(start, finish, diff));
    }
  },
});
