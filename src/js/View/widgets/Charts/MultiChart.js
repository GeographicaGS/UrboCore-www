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
* initialize own options:
*   - keysConfig (JS Object, mandatory) Format [dataKey]: { type: '', axis: ''}
*     - type (String, mandatory) Sets the key chart format as 'bar','scatter','line','area'.
*     - axis (Integer, mandatory) Sets the key axis. It could be only 1 (left Y Axis) or 2 (right Y Axis).
*
*   - showLineDots (Boolean, default: false). Show dots on lines without hover
*
*   - xAxisAdjustToContent (Boolean, default: false). Adjust the X axis domain to data's returned one instead of the requested
*/
App.View.Widgets.Charts.MultiChart = App.View.Widgets.Charts.Base.extend({
  initialize: function(options){
    if(!options.opts.has('keysConfig')) throw new Error('keysConfig parameter is mandatory');
    if(!options.opts.has('showLineDots')) options.opts.set({showLineDots: false});
    if(!options.opts.has('xAxisAdjustToContent')) options.opts.set({showLineDots: false});

    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);
  },

  render: function(){
    App.View.Widgets.Charts.Base.prototype.render.call(this);
    if(this.options.get('showLineDots')){
      this.$el.addClass('showLineDots');
    }
    return this;
  },

  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    this.data = this.collection.toJSON();
    var min = [],
        max = [];
    var _this = this;
    _.each(this.data, function(elem){
      elem.realKey = elem.key;
      if(_this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.key))
        elem.key = _this.options.get('legendNameFunc')(elem.key);

      if (_this.options.get('keysConfig')[elem.realKey]) {
        elem.type = _this.options.get('keysConfig')[elem.realKey].type;
        elem.yAxis = _this.options.get('keysConfig')[elem.realKey].axis;
      } else {
        elem.type = _this.options.get('keysConfig')['*'].type;
        elem.yAxis = _this.options.get('keysConfig')['*'].axis
      }

      if(elem.values && elem.values.length && elem.values[0].x && elem.values[0].x.constructor == Date){
        var timeFormatter = d3.time.format.iso;
        var axis = elem.yAxis - 1;
        var i = 0;
        min[axis] = min[axis] || [];
        max[axis] = max[axis] || [];
        _.each(elem.values, function(value){
          value.x = timeFormatter.parse(value.x);
          if(_this.options.get('stacked')){
            max[axis][i] = max[axis][i] ? max[axis][i] + value.y : value.y;
          }else{
            max[axis].push(value.y);
          }
          min[axis].push(value.y);
          i += 1;
        });
      }else{
        var axis = elem.yAxis - 1;
        var i = 0;
        min[axis] = min[axis] || [];
        max[axis] = max[axis] || [];
        _.each(elem.values, function(value){
          if(_this.options.get('stacked')){
            max[axis][i] = max[axis][i] ? max[axis][i] + value.y : value.y;
          }else{
            max[axis].push(value.y);
          }
          min[axis].push(value.y);
          i += 1;
        });
      }
    });

    // Order array
    if(this.options.get('legendOrderFunc'))
      _.sortBy(this.data, function(el){ return _this.options.get('legendOrderFunc')(el.realKey); });

    // Get max value for each axis and adjust domain
    var domains = this.options.get('yAxisDomain') ? this.options.get('yAxisDomain') : [[0,1],[0,1]];
    // Clear null from array
    if(min[0]) min[0] = min[0].filter(Boolean);
    if(min[1]) min[1] = min[1].filter(Boolean);
    var minAxis1 = Math.min.apply(null, min[0]),
        minAxis2 = Math.min.apply(null, min[1]);
    var maxAxis1 = Math.max.apply(null, max[0]),
        maxAxis2 = Math.max.apply(null, max[1]);
    if(domains[0][0] > minAxis1) domains[0][0] = Math.floor(minAxis1);
    if(domains[1][0] > minAxis2) domains[1][0] = Math.floor(minAxis2);
    if(domains[0][1] < maxAxis1) domains[0][1] = Math.ceil(maxAxis1);
    if(domains[1][1] < maxAxis2) domains[1][1] = Math.ceil(maxAxis2);
    this.options.set({yAxisDomain: domains});
  },

  _initChartModel: function(){
    this._chart = nv.models.multiChart()
        .showLegend(!this.options.get('hideLegend'))
        .color(this._colors)
        .margin({bottom:15, right: 80})
        .height(270)
        .noData(this.options.get('noDataMessage'))
        .legendRightAxisHint('')
        .useInteractiveGuideline(true)
    ;

    if(this.options.get('stacked')){
      this._chart.bars1.stacked(true);
      this._chart.bars2.stacked(true);
    }

    // this._chart.lines1.padData(true);
    // this._chart.lines2.padData(true);
    // this._chart.stack1.padData(true);
    // this._chart.stack2.padData(true);

    this._chart.yAxis1.tickPadding(10);
    this._chart.yAxis2.tickPadding(10);
  },

  _initLegend: function(){
    if(!this.options.get('hideLegend')){
      this._chart.legend.height(0)
        .width(0)
        .margin(0)
        .padding(0)
      ;

      // Aggregation
      var aggregationInfo = {};
      var _this = this;
      if(this.options.get('showAggSelector') && this.collection.options && this.collection.options.data && this.collection.options.data.agg && this.collection.options.data.agg.length > 0){
        _.each(this.collection.options.data.vars, function(var_id, idx){
          var varMetadata = App.mv().getVariable(var_id);
          if(varMetadata && varMetadata.get('var_agg') && varMetadata.get('var_agg').length > 0){
            aggregationInfo[var_id] = {
              available: varMetadata.get('var_agg'),
              current: _this.collection.options.data.agg[idx]
            };
          }
        });
      }

      this.$('.var_list').html(this._list_variable_template({
        colors: this.options.get('colors') ? this.options.get('colors') : d3.scale.category20().range(),
        classes: this.options.get('classes'),
        data : this.data,
        disabledList: this._internalData.disabledList,
        aggregationInfo: aggregationInfo
      }));

      this.$(".nv-legendWrap.nvd3-svg,.legendWrap.nvd3-svg").hide();
    }
  },

  _initTooltips: function(){
    if(!this.options.get('hideTooltip')){
      var _this = this;
      if(!this.options.get('tooltipFunc')){
        this._chart.interactiveLayer.tooltip.contentGenerator(function(obj){
          var templateData = {
            data: obj,
            utils: {}
          };
          if(_this.xAxisFunction){
            templateData.utils.xAxisFunction = _this.xAxisFunction;
          }
          if(_this.options.get('yAxisFunction') && _this.options.get('yAxisFunction').length >= 2){
            var serie1 = _.find(_this.data, {key: obj.series[0].key});
            if(serie1){
              obj.series[0].yAxisFunction = _this.options.get('yAxisFunction')[_this.options.get('keysConfig')[serie1.realKey].axis - 1];
            }
            var serie2 = _.find(_this.data, {key: obj.series[1].key});
            if(serie2){
              obj.series[1].yAxisFunction = _this.options.get('yAxisFunction')[_this.options.get('keysConfig')[serie2.realKey].axis - 1];
            }
          }
          return _this._template_tooltip(templateData);
        });
      }else{
        this._chart.tooltip.contentGenerator(this.options.get('tooltipFunc'));
      }
    }else{
      this._chart.tooltip.classes(['hide']);
    }
  },

  _formatXAxis: function(){
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin'): true)
      .tickFormat(this.xAxisFunction)

      .width(500)
    ;

    // var numElems = this.data[0] && this.data[0].values ? this.data[0].values.length : 0;
    // this._xScale = d3.time.scale();
    // this._container = d3.select(this.$('.chart')[0]);
    // this._availableWidth = (this._chart.width() || parseInt(this._container.style('width')) || 960) - this._chart.margin().left - this._chart.margin().right;
    //
    // this._xScale.rangeBands = this._xScale.range;
    // var _this = this;
    // var groupSpacing = this._chart.bars1.groupSpacing() || this._chart.bars2.groupSpacing() || .5;
    // this._xScale.rangeBand = function(){
    //   return Math.max((1 - groupSpacing) * _this._availableWidth / numElems, 2);
    // };
    //
    // // Test copy
    // this._xScaleLines = this._xScale.copy();
    // this._xScaleLines.rangeBand = function(){
    //   return this._xScale.rangeBand() / 2 + this._xScale.rangeBand();
    // };
    //
    // this._chart.xAxis.scale(this._xScale);
    // this._chart.bars1.xScale(this._xScale)
    // this._chart.bars2.xScale(this._xScale)
    // this._chart.stack1.xScale(this._xScale)
    // this._chart.stack2.xScale(this._xScale)
    // this._chart.lines1.xScale(this._xScaleLines)
    // this._chart.lines2.xScale(this._xScaleLines)

    if(this.data.length && this.data[0].values && this.data[0].values.length && this.data[0].values[0].x && this.data[0].values[0].x.constructor == Date){
      if(this.options.get('xAxisAdjustToContent')){
        var start = moment(this.data[0].values[0].x).startOf('hour');
        var finish = moment(this.data[0].values[this.data[0].values.length-1].x).endOf('hour').add(1, 'millisecond');
        var diff = parseInt(finish.diff(start, 'hours') / 6); // Diff / Default number of ticks
      }else{
        var start = moment(this.collection.options.data.time.start).startOf('hour');
        var finish = moment(this.collection.options.data.time.finish).endOf('hour').add(1, 'millisecond');
        var diff = parseInt(finish.diff(start, 'hours') / 6); // Diff / Default number of ticks
      }

      //  Get step hours
      var stepDiff = -1;
      if(this.collection.options.data.time.step){
        stepDiff = App.Utils.getStepHours(this.collection.options.data.time.step);
        if(diff !== -1){
          diff = Math.ceil(diff/stepDiff) * stepDiff;
        }
      }
      // Adjustments
      if(diff > 6 && diff < 12) diff = 12;

      // Manually create dates range
      var datesInterval = [];
      var nextDate = start.toDate();
      do {
        datesInterval.push(nextDate);
        nextDate = d3.time.hour.offset(nextDate, diff);
      }while(finish.isAfter(nextDate) && diff > 0);

      this._chart.xAxis
        .domain([start.toDate(),finish.toDate()])
        .tickValues(datesInterval)
      ;
    }
  },

  // _formatYAxis: function(){
  //   this._chart.yAxis1
  //     .tickFormat(this.options.get('yAxisFunction')[0]);
  //   this._chart.yAxis2
  //     .tickFormat(this.options.get('yAxisFunction')[1]);
  // },

  _formatYAxis: function(){
    var yDomain1 = this.options.get('yAxisDomain')[0];
    var diff = (yDomain1[1] - yDomain1[0]) / 5;

    var yInterval1 = [];
    var nextVal = yDomain1[0];
    do {
      yInterval1.push(nextVal);
      nextVal += diff;
    }while(yDomain1[1] > nextVal);

    this._chart.yAxis1
      .tickPadding(5)
      .showMaxMin(this.options.has('yAxisShowMaxMin') ? this.options.get('yAxisShowMaxMin'): true)
      .tickFormat(this.options.get('yAxisFunction')[0])
      .domain(yDomain1)
      .tickValues(yInterval1)
    ;

    var yDomain2 = this.options.get('yAxisDomain')[1];
    var diff = (yDomain2[1] - yDomain2[0]) / 5;

    var yInterval2 = [];
    var nextVal = yDomain2[0];
    do {
      yInterval2.push(nextVal);
      nextVal += diff;
    }while(yDomain2[1] > nextVal);

    this._chart.yAxis2
      .tickPadding(5)
      .showMaxMin(this.options.has('yAxisShowMaxMin') ? this.options.get('yAxisShowMaxMin'): true)
      .tickFormat(this.options.get('yAxisFunction')[1])
      .domain(yDomain2)
      .tickValues(yInterval2)
    ;
  },

  _forceYAxisDomain: function(){
    this._chart
      .yDomain1(this.options.get('yAxisDomain')[0]);
    this._chart
      .yDomain2(this.options.get('yAxisDomain')[1]);
  },
});
