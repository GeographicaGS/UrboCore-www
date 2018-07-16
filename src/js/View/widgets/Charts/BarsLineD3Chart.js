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
*/
App.View.Widgets.Charts.D3.BarsLine = App.View.Widgets.Charts.Base.extend({
  initialize: function(options){
    if(!options.opts.has('keysConfig')) throw new Error('keysConfig parameter is mandatory');
    if(!options.opts.has('showLineDots')) options.opts.set({showLineDots: false});

    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);

    _.bindAll(this, '_getColor');
  },

  _drawChart:function(){
    // Process data
    this._processData();

    // Create chart
    this._initChartModel();

    // // Order data keys for legend
    // if(this.options.get('legendOrderFunc'))
    //   this._orderLegendKeys();
    //
    // // Append data to chart
    // d3.select(this.$('.chart')[0])
    //     .datum(this.data)
    //     .call(this._chart);
    //
    // Create legend
    this._initLegend();

    // Create tooltips
    this._initTooltips();

    // // Adjustments
    // if(this.options.get('centerLegend'))
    //   this._centerLegend();
    //
    // if(this.options.get('xAxisLabel'))
    //   this._chart.xAxis.axisLabel(this.options.get('xAxisLabel'));
    //
    // if(this.options.get('yAxisLabel'))
    //   if(this._chart.yAxis){
    //     this._chart.yAxis.axisLabel(this.options.get('yAxisLabel'));
    //   }else if(this.options.get('yAxisLabel').length >= 2){
    //     this._chart.yAxis1.axisLabel(this.options.get('yAxisLabel')[0]);
    //     this._chart.yAxis2.axisLabel(this.options.get('yAxisLabel')[1]);
    //   }
    //
    // if(this.xAxisFunction)
    //   this._formatXAxis();
    //
    // if(this.options.get('yAxisFunction'))
    //   this._formatYAxis();
    //
    // if(this.options.has('xAxisDomain'))
    //   this._forceXAxisDomain();
    //
    // if(this.options.has('yAxisDomain'))
    //   this._forceYAxisDomain();
    //
    // if(this.options.get('yAxisAdjust'))
    //   this._adjustYAxis();
    //
    // // Force apply adjustments (TODO: fix this hack)
    // var _this = this;
    // setTimeout(function(){
    //   _this._chart.update();
    // },100);
    //
    // nv.utils.windowResize(this._chart.update);

    // Remove loading animation
    this.$('.loading.widgetL').addClass('hiden');
  },

  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    var tempData = this.collection.toJSON();
    this.data = [];
    var min = [],
        max = [];
    var _this = this;
    _.each(tempData, function(elem, dataIdx){
      // Check aggregations
      if(elem.values && elem.values.length && elem.values[0].y && elem.values[0].y.constructor === Array){
        _.each(elem.values[0].y, function(subelem, subElemIdx){
          var key = elem.key + '_' + subelem.agg.toLowerCase();
          var procSubelem = {
              key: (_this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.key)) ? _this.options.get('legendNameFunc')(elem.key) + ' (' + subelem.agg + ')' : key,
              agg: subelem.agg,
              realKey: key,
              type: _this.options.get('keysConfig')[key].type,
              yAxis: _this.options.get('keysConfig')[key].axis,
              values: []
          };

          if(elem.values && elem.values.length && elem.values[0].x){
            var axis = procSubelem.yAxis - 1;
            min[axis] = min[axis] || [];
            max[axis] = max[axis] || [];
            var i = 0;
            if(elem.values[0].x.constructor == Date){
              var timeFormatter = d3.time.format.iso;
              _.each(elem.values, function(value, idx){
                procSubelem.values[idx] = {
                  x: timeFormatter.parse(value.x),
                  y: value.y[subElemIdx].value
                };
                if(_this.options.get('stacked')){
                  max[axis][i] = max[axis][i] ? max[axis][i] + procSubelem.values[idx].y : procSubelem.values[idx].y;
                }else{
                  max[axis].push(procSubelem.values[idx].y)
                }
                min[axis].push(procSubelem.values[idx].y);
                i += 1;
              });
            }else{
              _.each(elem.values, function(value, idx){
                procSubelem.values[idx] = {
                  x: value.x,
                  y: value.y[subElemIdx].value
                };
                if(_this.options.get('stacked')){
                  max[axis][i] = max[axis][i] ? max[axis][i] + procSubelem.values[idx].y : procSubelem.values[idx].y;
                }else{
                  max[axis].push(procSubelem.values[idx].y)
                }
                min[axis].push(procSubelem.values[idx].y);
                i += 1;
              });
            }
          }

          _this.data.push(procSubelem);
        });
      }else{

        elem.realKey = elem.key;
        if(_this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.key, elem))
          elem.key = _this.options.get('legendNameFunc')(elem.key, elem);

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
          min[axis] = min[axis] || [];
          max[axis] = max[axis] || [];
          var i = 0;
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
        } else if(elem.values && elem.values.length && elem.values[0].x && elem.values[0].x.constructor != Date) {
          var axis = elem.yAxis - 1;
          min[axis] = min[axis] || [];
          max[axis] = max[axis] || [];
          var i = 0;
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
        _this.data.push(elem);
      }
    });

    // Sort data to bring lines to the end
    this.data.sort(function(a, b){
      return a.type > b.type;
    });
    // Get max value for each axis and adjust domain
    var domains =  [[0,1]];
    if(this.options.get('yAxisDomain')) {
      domains = JSON.parse(JSON.stringify(this.options.get('yAxisDomain')))
    } else if(this.data.length > 1){
        domains.push([0,1]);
    }

    var minAxis1 = Math.min.apply(null, min[0]),
        minAxis2 = Math.min.apply(null, min[1]);
    var maxAxis1 = Math.max.apply(null, max[0]),
        maxAxis2 = Math.max.apply(null, max[1]);
    if(domains[0][0] > minAxis1) domains[0][0] = Math.floor(minAxis1);
    if(domains[0][1] < maxAxis1) domains[0][1] = Math.ceil(maxAxis1);

    if(domains[1]) {
      if(domains[1][0] > minAxis2) domains[1][0] = Math.floor(minAxis2);
      if(domains[1][1] < maxAxis2) domains[1][1] = Math.ceil(maxAxis2);
    }
    this.yAxisDomain = domains;
  },

  _initChartModel: function(){

    // Clean all
    this.$('.chart').empty();
    this._chart = {};
    this._chart.margin = this.options.get('margin') || {top: 40, right: 80, bottom: 90, left: 80};
    if (this.options.get('hideYAxis2')) {
      this._chart.margin.right = 40;
    }
    this._chart.w = this.$el.innerWidth() - (this._chart.margin.left + this._chart.margin.right),
    // this._chart.h = this.$el.innerHeight() - (this._chart.margin.top + this._chart.margin.bottom);
    this._chart.h = 330 - (this._chart.margin.top + this._chart.margin.bottom); // TODO: Height is set manually until the widget layout is changed to flex  to allow better height detectin

    var _this = this;

    this._chart.svg = d3.select(this.$('.chart')[0])
      .attr('width', this._chart.w + (this._chart.margin.left + this._chart.margin.right))
      .attr('height', this._chart.h + (this._chart.margin.top + this._chart.margin.bottom))
      .attr('class', 'chart d3')
      .append('g')
        .attr('transform', 'translate(' + this._chart.margin.left + ',' + this._chart.margin.top + ')');

    if(this.options.get('stacked')){
      this.stackedRawData = {};
      _.each(this.data, function(el){
        if(el.type === 'bar' && ! _this._internalData.disabledList[el.realKey]){
          _this.stackedRawData[el.realKey] = el; // el.values
        }
      });
      this.stackedData = _.map(this.stackedRawData, function(val, key){
        return val;
      });
    }

    if(this.data[1]) {
      this.xScaleBars = d3.scale.ordinal()
        .domain(d3.range(this.data[1].values.length))
        .rangeRoundBands([0, this._chart.w], this.options.get('groupSpacing'));
    } else {
      this.xScaleBars = d3.scale.ordinal()
        .domain(d3.range(this.data[0] ? this.data[0].values.length : 0))
        .rangeRoundBands([0, this._chart.w], this.options.get('groupSpacing'));
    }

    this.xScaleLine = function(d) {
      var offset = _this.xScaleBars.rangeBand() / 2;
      return _this.xScaleBars(d) + offset;
    };

    this.yScales = [
      d3.scale.linear()
        .domain(this.yAxisDomain[0])
        .range([this._chart.h, 0])
    ]
    if(this.yAxisDomain[1]) {
      this.yScales.push(
        d3.scale.linear()
          .domain(this.yAxisDomain[1])
          .range([this._chart.h, 0])
      )
    }

    // Axis
    this._formatXAxis();
    this._formatYAxis();

    // Line generator
    this.lineGen = d3.svg.line()
      .x(function(d, idx) {
        return _this.xScaleLine(idx);
      })
      .y(function(d, idx) {
        return _this.yScales[this.parentElement.__data__.yAxis - 1](d.y);
      })
      .interpolate('monotone')
    ;

    // Draw
    if (this._chart.xAxis) {
      this._chart.svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + this._chart.h + ')')
        .call(this._chart.xAxis);

      
      var xAxis = this._chart.svg
        .selectAll('.axis.x-axis .tick');

      if (this.options.get('useImageAsLegendX')) {
        xAxis
          .selectAll('text')
          .remove();

        xAxis
          .append("image")
          .attr("xlink:href", function(d, i) {
            return _this.options.get('yAxisTickFormat')(_this.data[0].values[d].x);
          })
          .attr("width", 16)
          .attr("height", 16)
          .attr('x', -8)
          .attr('y', 8);
      }

      var yAxis1 = this._chart.svg.append('g')
        .attr('class', 'axis y-axis y-axis-1')
        .call(this._chart.yAxis1);
      if(this.options.get('yAxisLabel')){
        yAxis1.append('text')
          .attr('class', 'axis-label')
          .attr('x', -1 * this._chart.h / 2)
          .attr('transform', 'rotate(270) translate(0,'+ (12 - _this._chart.margin.left) +')')
          .style('text-anchor', 'middle')
          .text(_this.options.get('yAxisLabel')[0])
        ;
      }

      if(this.yAxisDomain[1] && !this.options.get('hideYAxis2')){
        var yAxis2 = this._chart.svg.append('g')
          .attr('class', 'axis y-axis y-axis-2')
          .attr('transform', 'translate(' + this._chart.w + ',0)')
          .call(this._chart.yAxis2);
        if(this.options.get('yAxisLabel')){
          yAxis2.append('text')
            .attr('class', 'axis-label')
            .attr('x', this._chart.h / 2)
            .attr('transform', 'rotate(90) translate(0,-68)')
            .style('text-anchor', 'middle')
            .text(this.options.get('yAxisLabel')[1])
          ;
        }
      }

      if(this.options.has('yAxisThresholds')){
        // Format thresholds
        var _this = this;
        var ticks = d3.selectAll(this.$('g.axis.y-axis-1 g.tick line'));
        ticks
          .attr('style', function(d,i){
            var style = '';
            var thresholdCfg = _this.options.get('yAxisThresholds')[i];
            if(thresholdCfg){
              style += 'stroke-dasharray: 4; stroke: ' + thresholdCfg.color;
            }else if(_this.options.get('yAxisThresholds').length){
              style += 'stroke-dasharray: 4; stroke: ' + _this.options.get('yAxisThresholds')[_this.options.get('yAxisThresholds').length - 1].color;
            }
            return style;
          });
        for(var i = 0; i < ticks[0].length -1;i++){
          var y = ticks[0][i+1].getCTM().f - this._chart.margin.top;
          var width = ticks[0][i].getBoundingClientRect().width;
          var height = ticks[0][i].getCTM().f - ticks[0][i+1].getCTM().f;
          var g = this._chart.svg.append('g');
          g.append('rect')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', this.options.get('yAxisThresholds')[i].color)
            .attr('style', 'opacity: .1')
          ;
          g.append('text')
            .text(__(this.options.get('yAxisThresholds')[i].realName))
            .attr('class', 'axis-label')
            .attr('x', 10)
            .attr('y', y + height / 2)
            .attr('dy', '.32em')
            .attr('width', width)
            .attr('height', height / 2)
            .attr('class', 'thresholdLabel')
          ;
        }
      }

      this._drawElements();
    } else {
      this._chart.svg.append('text')
        .attr('transform', 'translate(80,' + this._chart.h/2 + ')')
        .attr('text-anchor', 'middle')
        .attr('fill','#fff')
        .attr('font-size','35px')
        .text(__('No hay datos'));
    }
  },

  _drawElements: function() {
    var _this = this;
    this.data.forEach(function(data){
      switch (data.type) {
        case 'bar':
          if(_this.options.get('stacked')){
            _this._drawStackedBar(_this.stackedData);
          }else{
            _this._drawSimpleBar(data);
          }
          break;
        case 'line':
          if(!_this._internalData.disabledList[data.realKey]){
            _this._drawLine(data);
          }
      }
    });
  },

  _drawLine: function(data){
    var _this = this;
    this._chart.line = this._chart.line || [];
    var line = this._chart.svg.append('g').selectAll('.lineGroup')
      .data([data]).enter()
      .append('g')
        .attr('class', 'lineGroup')
        .attr('key', function(d){ return d.realKey; })
        .style('fill', function(d, idx) { return _this._getColor(this.__data__, idx); })
        .style('stroke', function(d, idx) { return _this._getColor(this.__data__, idx); })
      ;

      line.append('path')
      .datum(data.values)
      .attr('class', function(d, idx){
        var extraClass =  _this._getClasses(this.parentElement.__data__, idx);
        return 'line ' + extraClass;
      })
      .attr('style', 'fill: none')
      .style('stroke', function(d, idx) {
        return _this._getColor(this.parentElement.__data__, idx);
      })
      .attr('d', this.lineGen);

    line.selectAll('.point')
      .data(data.values).enter()
      .append('circle')
        .attr('class', 'point')
        .attr('cx', function(d, idx) { return _this.xScaleLine(idx); })
        .attr('cy', function(d, idx) { return _this.yScales[this.parentElement.__data__.yAxis - 1](d.y); })
        .attr('r', 3)
        .attr('data-y', function(d, idx) {return d.y});

    

    this._chart.line.push(line);
  },

  _drawSimpleBar: function(data){
    var _this = this;
    this._chart.bars = this._chart.bars || [];
    // this._chart.bars = this._chart.svg.selectAll('.bar')
    var bar = this._chart.svg.append('g').data([data])
    bar.selectAll('.bar')
      .data(data.values).enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d, idx) {return _this.xScaleBars(idx);})
        .attr('y', function(d, idx) {
          return _this.yScales[this.parentElement.__data__.yAxis - 1](d.y);
        })
        .attr('width', function(d) {return _this.xScaleBars.rangeBand();})
        .attr('height', function(d) {return _this._chart.h - _this.yScales[this.parentElement.__data__.yAxis - 1](d.y);})
        .style('fill', function(d,idx){
          return _this._getColor(this.parentElement.__data__, idx);
        })
        .attr('data-idx', function(d, idx) {return idx; })
      ;
    this._chart.bars.push(bar);
  },

  _drawStackedBar: function(data){
    var _this = this;
    this._chart.bars = this._chart.bars || [];
    var layers = d3.layout.stack()
      .values(function(d){ return d.values })
      (data);

    var bar = this._chart.svg.append('g').data([data]);

    bar = this._chart.svg.selectAll('.layer')
      .data(layers)
      .enter().append('g')
        .attr('class', 'layer')
        .attr('key', function(d){ return d.realKey; })
        .style('fill', function(d,idx){
          return _this._getColor(d, idx);
        });
    bar.selectAll('rect')
      .data(function(d) {
        return d.values; })
      .enter().append('rect')
        .attr('x', function(d, idx) { return _this.xScaleBars(idx); })
        .attr('y', function(d, idx) { return _this.yScales[this.parentElement.__data__.yAxis - 1](d.y + d.y0); })
        .attr('height', function(d) {
          return _this.yScales[this.parentElement.__data__.yAxis - 1](d.y0) - _this.yScales[this.parentElement.__data__.yAxis - 1](d.y + d.y0);
        })
        .attr('width', _this.xScaleBars.rangeBand() - 1)
        .attr('data-idx', function(d, idx) {return idx; })
      ;
    this._chart.bars.push(bar);
  },

  _formatXAxis: function(){
    if(this.data.length && this.data[0].values && this.data[0].values.length && this.data[0].values[0].x && this.data[0].values[0].x.constructor == Date){
      var start = moment(this.data[0].values[0].x).startOf('hour');
      var finish = moment(this.data[0].values[this.data[0].values.length - 1].x).endOf('hour').add(1, 'millisecond');
      var diff = parseInt(finish.diff(start, 'hours') / 6); // Diff / Default number of ticks

      //  Get step hours
      var stepDiff = -1;
      if(this.collection.options.data.time && this.collection.options.data.time.step){
        stepDiff = App.Utils.getStepHours(this.collection.options.data.time.step);
        if(diff !== -1){
          diff = Math.ceil(diff/stepDiff) * stepDiff;
        }
      }
      // Adjustments
      if (diff === 0) diff = 1; // If diff is 0 => Infinite loop in lines 538-541 (do-while)
      if(diff > 6 && diff < 12) diff = 12;

      // Manually create dates range
      var datesInterval = [];
      var nextDate = start.toDate();
      do {
        datesInterval.push(nextDate);
        nextDate = d3.time.hour.offset(nextDate, diff);
      }while(finish.isAfter(nextDate));

      var _this = this;
      this._chart.xAxis = d3.svg.axis()
        .scale(this.xScaleBars)
        .orient('bottom')
        .tickFormat(function(d) {
          if(_this.data[0].values.length > datesInterval.length + 1){
            if((d*stepDiff) % diff === 0 && (d*stepDiff/diff) < datesInterval.length)
              return _this.xAxisFunction(datesInterval[d*stepDiff/diff]);
            else
              return '';
          }else if(d < datesInterval.length){
            return _this.xAxisFunction(datesInterval[d]);
          }else{
            return '';
          }
        })
        // .tickValues(datesInterval)
        .tickSize([])
        .tickPadding(10)
      ;

    } else if(this.data.length && this.data[0].values && this.data[0].values.length && this.data[0].values[0].x && this.data[0].values[0].x.constructor != Date){
      var _this = this;
      this._chart.xAxis = d3.svg.axis()
        .scale(this.xScaleBars)
        .orient('bottom')
        .tickFormat(function(d) {
          return _this.options.get('yAxisTickFormat')(_this.data[0].values[d].x);
        })
        .tickSize([])
        .tickPadding(10);
    }
  },

  _formatYAxis: function(){
    var diff = (this.yAxisDomain[0][1] - this.yAxisDomain[0][0]) / 4;
    var range;
    if(!this.options.has('yAxisThresholds')){
      range = d3.range(
        this.yAxisDomain[0][0],
        this.yAxisDomain[0][1],
        diff
      );
    }else {
      range = _.pluck(this.options.get('yAxisThresholds'),'startValue').sort(function(a,b){ return a - b; });
    }

    range.push(this.yAxisDomain[0][1]);
    this._chart.yAxis1 = d3.svg.axis()
      .scale(this.yScales[0])
      .orient('left')
      .tickValues(range)
      .tickSize(-1 * this._chart.w ,0)
      .tickPadding(10)
      .tickFormat(this.options.get('yAxisFunction')[0])
    ;

    if(this.yAxisDomain[1]){
      diff = (this.yAxisDomain[1][1] - this.yAxisDomain[1][0]) / 4;
      range = d3.range(
        this.yAxisDomain[1][0],
        this.yAxisDomain[1][1],
        diff
      );

      range.push(this.yAxisDomain[1][1]);
      this._chart.yAxis2 = d3.svg.axis()
        .scale(this.yScales[1])
        .orient('right')
        .tickValues(range)
        .tickSize([])
        .tickPadding(10)
        .tickFormat(this.options.get('yAxisFunction')[1]);
    }
  },

  _getColor: function(d,idx){
    if(typeof this.options.get('colors') === 'function'){
      return this.options.get('colors')(d, idx);
    }else if(this.options.get('colors') && this.options.get('colors').length > 0){
      return this.options.get('colors')[idx];
    }else{
      return '#333';
    }
  },

  _getClasses: function(d,idx){
    if(typeof this.options.get('classes') === 'function'){
      return this.options.get('classes')(d, idx);
    }else if(this.options.get('classes') && this.options.get('classes').length > 0){
      return this.options.get('classes')[idx];
    }else{
      return '';
    }
  },

  _initLegend: function(){
    if(!this.options.get('hideLegend')){
      this.$('.var_list').html(this._list_variable_template({
        colors: this.options.get('colors'),
        classes: this.options.get('classes'),
        data : this.data,
        disabledList: this._internalData.disabledList,
        aggregationInfo: this._aggregationInfo
      }));
    }
  },

  _clickLegend: function(element) {
    var tags = $(".btnLegend").size();
    var realKey = $(element.target).closest("div").attr("id");

    var disabledList = this._internalData.disabledList;
    if(((disabledList[realKey] == undefined || disabledList[realKey] === false) && this._internalData.elementsDisabled != tags - 1) || disabledList[realKey] === true) {
      // var active   = $(element.target).parent().hasClass('inactive') ? false : true,
      //     newOpacity = active ? 0 : 1;
      //
      // d3.select(this.$('g[key=' + realKey + ']')[0]).style('opacity', newOpacity);
      // $(element.target).parent().toggleClass('inactive');

      disabledList[realKey] = !disabledList[realKey];
      this._internalData.elementsDisabled = disabledList[realKey] ? this._internalData.elementsDisabled + 1 : this._internalData.elementsDisabled - 1;

      // Force redraw
      this._drawChart();
    }
  },

  _initTooltips: function(){
    var _this = this;
    if(this._chart.bars){
      this._chart.bars.forEach(function(barchart){
        _this._setTooltipEvents(barchart.selectAll('rect'), _this);
      });
    }

    if(this._chart.line) {
      this._chart.line.forEach(function(lineGroup){
        _this._setTooltipEvents(lineGroup.selectAll('.point'), _this);
      });
    }
  },

  _setTooltipEvents: function(elem, _this){
    elem
      .on('mouseover', function(d, serie, index){
            _this._drawTooltip(d, serie, index, this);
          })
      .on('mousemove', function(d, serie, index){
        _this._drawTooltip(d, serie, index, this);
      })
      .on('mouseout', function(d, serie, index){
        _this._hideTooltip(d, serie, index, this);
      })
    ;
  },

  _drawTooltip: function(d, serie, index, _this){
    var $tooltip = this.$('#chart_tooltip');
    if(!$tooltip.length){
      $tooltip = $('<div id="chart_tooltip" class="hidden"></div>');
      this.$el.append($tooltip);
    }
    var data = {
      value: d.x,
      series: []
    };

    var that = this;
    this.data.forEach(function(el){
      if(!that._internalData.disabledList[el.realKey]){
        data.series.push({
          value: el.values[serie].y,
          key: el.key,
          realKey: el.realKey,
          color: that._getColor(el, serie),
          cssClass: that.options.has('classes') ? that.options.get('classes')(el): '',
          yAxisFunction: that.options.get('yAxisFunction')[el.yAxis - 1]
        });
      }
    });
    $tooltip.html(this._template_tooltip({
      data: data,
      utils: {
        xAxisFunction: this.xAxisFunction
      }
    }));
    var cursorPos = d3.mouse(_this);
    $tooltip.css({position: 'absolute'});
    if (cursorPos[0] + $tooltip.width() > this.$el.width() - 100) {
      $tooltip.css({
        top: cursorPos[1],
        zIndex: 2,
        left: cursorPos[0] - $tooltip.width() - 100
      });
    }else {
      $tooltip.css({
        top: cursorPos[1],
        zIndex: 2,
        left: cursorPos[0] - 50
      });
    }

    $tooltip.removeClass('hidden');
  },

  _hideTooltip: function() {
    this.$('#chart_tooltip').addClass('hidden');
  },
});
