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

/*
 * initialize own options:
 *  - percentMode: (Boolean, optional) Show data in percentage mode
 */
App.View.Widgets.Charts.FillBar = App.View.Widgets.Charts.Bar.extend({
  initialize: function(options){
    if(!options.opts.has('percentMode'))
      options.opts.set({percentMode: false});
    if(options.opts.get('percentMode') && !options.opts.has('maxValue'))
      options.opts.set({maxValue: 100});
    if(options.opts.get('yAxisDomain') && !options.opts.has('maxValue'))
      options.opts.set({maxValue: options.opts.get('yAxisDomain')[1]});
    App.View.Widgets.Charts.Bar.prototype.initialize.call(this,options);
    this.model = options.data;
    _.bindAll(this, "_drawChart");
  },

  _drawChart: function(){
    var _this = this;
    this.graph = nv.addGraph({
        generate: function() {
          App.View.Widgets.Charts.Base.prototype._drawChart.call(_this);
          _this._drawExtra();
        },
        callback: function() {
          if(_this.options.get('disableClick')){
            if(_this._chart.discretebar) _this._chart.discretebar.dispatch.elementClick = undefined;
            if(_this._chart.multibar) _this._chart.multibar.dispatch.elementClick = undefined;
          }
          return true;
        }
    });
  },

  _fetchData: function(){
    this.model.fetch({
      success: this._drawChart,
      data: this.model.options ? this.model.options.data || {} : {}
    });
  },

  _processData: function(){
    this.data = [];
    var elem = this.model.toJSON();
    var realKey = elem.variable;
    var key =  this.options.get('legendNameFunc') && this.options.get('legendNameFunc')(elem.variable) ? this.options.get('legendNameFunc')(elem.variable) : elem.variable;

    this.data.push({
      key: key,
      realKey: realKey,
      values:[
        {
          realKey: realKey,
          x: key,
          y: this.options.get('percentMode') ? elem.value / elem.max * 100 : elem.value
        }
      ]
    });

    // Extract colors
    this._colors = this.options.get('colors');
    if(this.options.has('divisorLines')) {
      var divisorLines = this.options.get('divisorLines');
      for(var i = divisorLines.length; i > 0; i--){
        if(this.data[0].values[0].y >= divisorLines[i-1].value){
          this._colors = [divisorLines[i-1].color];
          this.data[0].values[0].status = i - 1;
          break;
        }
      }
    }
  },

  _initChartModel: function(){
    this._chart = nv.models.multiBarChart()
        .showControls(false)
        .showLegend(!this.options.get('hideLegend'))
        .stacked(this.options.get('stacked'))
        .groupSpacing(0)
        .reduceXTicks(true)
        .staggerLabels(false)
        .color(this._colors)
        .margin({bottom:15, top: 0})
        .height(270)
        .width(300)
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.yAxis.tickPadding(10);

    if(this.options.has('maxValue')){
      this._chart.forceY([0,this.options.get('maxValue')]);
    }

    if(this.options.get('hideLegend')){
      this._chart.margin({
        top: 30,
        bottom: 15
      })
    }
  },

  _drawExtra: function(){
    if(this.options.has('maxValue')){
      var tickValues = [];
      var divisor = this.options.get('formatYAxis') ? this.options.get('formatYAxis').numberOfValues ? this.options.get('formatYAxis').numberOfValues : 4 : 4;
      var max = this.options.get('maxValue') >= this.data[0].values[0].y ? this.options.get('maxValue') : this.data[0].values[0].y;
      for(var i = 0; i < max; i+=max/divisor) {
        tickValues.push(i);
      }
      var functionTickFormat = function(d) {
        return App.d3Format.numberFormat('s')(d);
      };
      if(this.options.get('formatYAxis') && this.options.get('formatYAxis').tickFormat) {
        functionTickFormat = this.options.get('formatYAxis').tickFormat;
      }
      this._chart.yAxis
        .tickValues(tickValues)
        .showMaxMin(true)
        .tickFormat(functionTickFormat)
      ;
    }
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(false)
      .tickFormat(this.options.get('xAxisFunction'))
    ;

    var svg = d3.select(this.$('.chart')[0]);
    var barsWrapCTM = d3.select(this.$('.nv-barsWrap')[0]).node().getCTM();
    var svgBBox = svg.node().getBBox();

    svg.insert('rect', '.nv-wrap')
      .attr('id', 'nv-bg')
      .attr('x', barsWrapCTM.e) // start rectangle where barsWrap will start
      .attr('y', barsWrapCTM.f) // start rectangle where barsWrap will start
      .attr('width', svgBBox.width - barsWrapCTM.e + svgBBox.x) // full width
      .attr('height', svgBBox.height - barsWrapCTM.f + svgBBox.y - 23) // full height - barsWrap margin - chart margin
      .attr('fill', 'rgba(66,139,202, 0.2)');

    //Linea divisoria para warning y error
    if(this.options.has('divisorLines')) {
      var _this = this;
      _.each(this.options.get('divisorLines'), function(o) {
        svg.append('line')
        .attr({
            x1: barsWrapCTM.e,
            y1: _this._chart.yAxis.scale()(o.value) + barsWrapCTM.f,
            x2: svgBBox.width + svgBBox.x,
            y2: _this._chart.yAxis.scale()(o.value) + barsWrapCTM.f
        })
        .style('stroke', o.color)
        .style('stroke-dasharray', ('3, 3'));
      });
    }
  },

  // _centerChart: function(){
  //   // Raise chart to center it
  //   var multiBarWrapper = d3.select(this.$('.nvd3.nv-wrap.nv-multiBarWithLegend')[0]);
  //   var nvBg = d3.select(this.$('#nv-bg')[0]);
  //   multiBarWrapper.attr('transform', 'translate(60,35)');
  //   nvBg.attr('y','35');
  // }
});
