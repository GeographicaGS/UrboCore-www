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

App.View.Widgets.Charts.Grid =  App.View.Widgets.Charts.Base.extend({

  _list_variable_template: _.template( $('#chart-base_chart_range_legend').html() ),

  initialize: function(options) {

    if (options && options.opts && !options.opts.get('xRangeLabels')) {
      options.opts.set('xRangeLabels', {start:true, end:true});
    }

    App.View.Widgets.Charts.Base.prototype.initialize.call(this, options);
  },

  onClose: function(){
    this.stopListening();
  },

  _drawChart:function(){

    this._processData();

    this._initChartModel();

    this._initLegend();

    this._initTooltips();

    this.$('.loading.widgetL').addClass('hiden');
  },

  _processData: function(){
    this.yAxisDomain = _.map(this.collection.toJSON(), function(c){ return c.day; });
    var dataset = _.map(_.flatten(_.map(this.collection.toJSON(), function(c){ return c.data })), function(v){ return parseFloat(v)});
    this.max = parseFloat(_.max(dataset));
    this.min = parseFloat(_.min(dataset));
  },

  _initChartModel: function(){
    var _this = this;
    this.$('.chart').empty();
    this._chart = {};
    this._chart.margin = {top: 40, right: 40, bottom: 100, left: 40},
    this._chart.w = this.$el.innerWidth() - (this._chart.margin.left + this._chart.margin.right),
    this._chart.h = this.$el.innerHeight() - (this._chart.margin.top + this._chart.margin.bottom);
    // this._chart.h = 334 - (this._chart.margin.top + this._chart.margin.bottom);

    var _this = this;
    this._chart.svg = d3.select(this.$('.chart')[0])
    .attr('width', this._chart.w + (this._chart.margin.left + this._chart.margin.right))
    .attr('height', this._chart.h + (this._chart.margin.top + this._chart.margin.bottom))
    .attr('class', 'chart d3 table_chart')
    .append('g')
    .attr('transform', 'translate(' + this._chart.margin.left + ',' + this._chart.margin.top + ')');


    var rectWidth = Math.ceil(this._chart.w / this.collection.toJSON()[0].data.length);
    var rectHeight = (this._chart.h + 20) / this.collection.toJSON().length;

    this.yScaleLine = d3.scale.ordinal()
    .domain(this.yAxisDomain)
    .rangePoints([0,this._chart.h])
    ;

    this._formatYAxis();

    this._chart.svg.append('g')
    .attr('class', 'axis')
    .call(this._chart.yAxis);


    this._chart.svg.append("line")
    .attr('class', 'line_block')
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", this._chart.h + 40)
    .attr('transform', 'translate(0,-20)')
    ;

    _this._chart.svg.append("text")
    .attr('class', 'text_axis')
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "start")
    .attr('transform', 'translate(8,-15)')
    .text(_this.options.get('dateFunction')(_this.options.get('startDate')))
    ;

    var indexRange = 0,
    keyRange,
    cum,
    extraSpace,
    fileName;

    var data = this._chart.svg.append('g').attr('class', 'data').attr('transform', 'translate(0,-12)');
    _.each(this.collection.toJSON(), function(c,file) {

      indexRange = 0;
      keyRange  = Object.keys(_this.options.get('xRrange'))[0];
      cum = _this.options.get('xRrange')[keyRange];
      extraSpace = 0;
      fileName = c.day;

      _.each(c.data,function(d,column) {
        // var extraSpace = 0 ;
        if(cum == column){
          extraSpace += 3;
          if(file == 0){
            //Separadores de bloques
            _this._chart.svg.append("line")
            .attr('class', 'line_block')
            .attr("x1", rectWidth * cum + extraSpace)
            .attr("y1", 0)
            .attr("x2", rectWidth * cum + extraSpace)
            .attr("y2", _this._chart.h + 40)
            .attr('transform', 'translate(0,-20)')
            ;
            //Texto en el eje y
            _this._chart.svg.append("text")
            .attr('class', 'text_axis')
            .attr("x", (rectWidth * cum) - ((_this.options.get('xRrange')[keyRange]/2) * rectWidth) + extraSpace)
            .attr("y", _this._chart.h + 30)
            .attr("text-anchor", "middle")
            .text(keyRange)
            ;

            //Texto que va entre los separadores
            if(_this.options.get('xRangeLabels').start) {
              _this._chart.svg.append("text")
              .attr('class', 'text_axis')
              .attr("x", rectWidth * cum + extraSpace)
              .attr("y", 0)
              .attr("text-anchor", "start")
              .attr('transform', 'translate(8,-15)')
              .text(_this.options.get('dateFunction')(_this.options.get('nextDateFunction')(_this._currentDate.clone())))
              ;
            }

            if(_this.options.get('xRangeLabels').end) {
              _this._chart.svg.append("text")
              .attr('class', 'text_axis')
              .attr("x", rectWidth * cum + extraSpace)
              .attr("y", 0)
              .attr("text-anchor", "end")
              .attr('transform', 'translate(-8,-15)')
              .text(_this.options.get('dateFunction')(_this._currentDate))
              ;
            }
          }
          indexRange ++;
          keyRange  = Object.keys(_this.options.get('xRrange'))[indexRange],
          cum += _this.options.get('xRrange')[keyRange];

        }

        data.append("rect")
        .attr("x", column * rectWidth + extraSpace)
        .attr("y", file * rectHeight)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("height", rectHeight-2)
        .attr("width", rectWidth - 2)
        .attr('transform', 'translate(2,2)')
        .attr('fill', _this._getColor(d))
        .attr('date', _this._getDate(fileName, column))
        .attr('value', d)
        ;
      });

      if(file == 0){

        _this._chart.svg.append("line")
        .attr('class', 'line_block')
        .attr("x1", rectWidth * cum + extraSpace + 2)
        .attr("y1", 0)
        .attr("x2", rectWidth * cum + extraSpace + 2)
        .attr("y2", _this._chart.h + 40)
        .attr('transform', 'translate(0,-20)')
        ;

        _this._chart.svg.append("text")
        .attr('class', 'text_axis')
        .attr("x", (rectWidth * cum) - ((_this.options.get('xRrange')[keyRange]/2) * rectWidth) + extraSpace)
        .attr("y", _this._chart.h + 30)
        .attr("text-anchor", "middle")
        .text(keyRange)
        ;

        _this._chart.svg.append("text")
        .attr('class', 'text_axis')
        .attr("x", rectWidth * cum + extraSpace)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .attr('transform', 'translate(-8,-15)')
        .text(_this.options.get('dateFunction')(_this._currentDate))
        ;

      }

    });
  },

  _formatYAxis: function(){
    this._chart.yAxis = d3.svg.axis()
    .scale(this.yScaleLine)
    .orient('left')
    .tickFormat(this.options.get('yAxisFunction'))
    ;
  },

  _getColor:function(d){
    let colors = this.options.get('colors');
    if (typeof colors === 'function') {
      return colors(d);
    }else {
      var legend = this.options.get('legend');
      if(typeof legend === 'function') {
        legend = legend(this.min, this.max)
      }
      legend = legend.toJSON();
      for(var i=0; i<legend.length; i++){
        if(d != null && d >=legend[i].min && (d < legend[i].max || legend[i].max == null) )
        return legend[i].color;
      }
      return '#0d5166 ';
    }
  },

  _getDate:function(d,index){
    var date = this.options.get('yAxisFunctionPopup') ? this.options.get('yAxisFunctionPopup')(d):d;
    date += ', '
    if(index == 0){
      this._currentDate = this.options.get('startDate').clone();
    }else {
      this._currentDate = this.options.get('nextDateFunction')(this._currentDate);
    }

    date += this.options.get('dateFunction')(this._currentDate);

    return date;
  },

  _initTooltips:function(){
    var _this = this;
    d3.select(_this.$('.chart .data')[0]).selectAll('rect')
    .on('mouseover', function(){
      _this._drawTooltip(d3.select(this).attr('date'), d3.select(this).attr('value'),this);
    })
    .on('mousemove', function(){
      _this._drawTooltip(d3.select(this).attr('date'), d3.select(this).attr('value'),this);
    })
    .on('mouseout', function(){
      _this._hideTooltip();
    })
    ;
  },

  _drawTooltip: function(date,value,_this){
    var $tooltip = this.$('#chart_tooltip');
    if(!$tooltip.length){
      $tooltip = $('<div id="chart_tooltip" class="hidden"></div>');
      this.$el.append($tooltip);
    }
    var data = {
      value: date,
      series: [{
        value:value,
        key: this.options.get('keySerie'),
        color:this._getColor(value),
        yAxisFunction: this.options.get('xAxisFunctionPopup')
      }]
    };

    $tooltip.html(this._template_tooltip({
      data: data,
      utils:{

      }
    }));
    var cursorPos = d3.mouse(_this);
    $tooltip.css({position: 'absolute'});
    if (cursorPos[0] + $tooltip.width() > this.$el.width() - 100) {
      $tooltip.css({
        top: cursorPos[1],
        left: cursorPos[0] - $tooltip.width() - 100
      });
    }else {
      $tooltip.css({
        top: cursorPos[1],
        left: cursorPos[0] - 30
      });
    }

    $tooltip.removeClass('hidden');
  },

  _hideTooltip: function() {
    this.$('#chart_tooltip').addClass('hidden');
  },

  _initLegend: function(){
    if(!this.options.get('hideLegend')){
      var legend = {
        title: this.options.get('titleLegend'),
      }

      if(typeof this.options.get('legend') === 'function') {
        if(this.options.has('classLegend')) {
          legend.legendclass = this.options.get('classLegend');
          legend.data = undefined;
        } else {
          legend.data = this.options.get('legend')(this.min, this.max).toJSON();
        }

      }
      else {
        let legendCollection = this.options.get('legend');
        if (legendCollection){
          legend.data = legendCollection.toJSON();
        }
      }

      this.$('.var_list').html(this._list_variable_template(legend));
    }
  },

  _fetchData: function(){
    var requestData = this.collection.options.data;

    // Step
    if(this.options.get('currentStep')){
      requestData.time.step = this.options.get('currentStep');
    }

    // Date
    if(requestData && requestData.time && requestData.time.start){
      if (!requestData.time.finish) {
        var date = App.ctx.getDateRange();
        requestData.time.start = date.start;
        requestData.time.finish = date.finish;
      }
    }

    // Aggregation
    if(this._aggregationInfo){
      var _this = this;
      var aggs = [];
      _.each(this.collection.options.data.vars, function(var_id){
        if(_this && _this._aggregationInfo[var_id])
          aggs.push(_this._aggregationInfo[var_id].current);
      });
      this.collection.options.data.agg = aggs;
    }

    this.collection.fetch({
      reset:true,
      data: requestData
    });
  },

});
