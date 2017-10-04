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
  initialize: function(options){
    if(!options.opts.has('percentMode'))
      options.opts.set({percentMode: false});
    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);
    _.bindAll(this, "_drawChart");
  },

  _processData: function(){
    this.data = [];
    var _this = this;

    _.each(this.collection.toJSON(), function(c, index) {
      for(var key in c){
        var item = {
          realKey: key,
          key: _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key) ? _this.options.get('legendNameFunc')(key) : key,
          values: c[key]
        };
        _this.data.push(item);
      }
    });
  },

  _initChartModel: function(){
    this._chart = nv.models.scatterChart()
        .margin({'right':30})
        .height(300)
        .pointSize(64)
        .pointRange([64,64])
        // .useVoronoi(false)
        .noData(__('No hay datos disponibles'))
        .color(this.options.get('colors'))
    ;

    this._chart.yAxis.tickPadding(10);

    if(this.options.get('percentMode')){
      this._chart.forceY([0,100]);
    }
  },

  _formatXAxis: function(){
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin'): true)
      .tickFormat(this.options.get('xAxisFunction'))
      // TODO: parametrize or calculate the number of ticks
      // .ticks(6)
    ;

    var start, finish, diff;
    if(this.options.has('xAxisDomain')){
      start = this.options.get('xAxisDomain')[0];
      finish = this.options.get('xAxisDomain')[1];
    }else{
      if(this.data.length > 1 && this.data[0].values && this.data[0].values.length && this.data[1].values && this.data[1].values.length
      && typeof this.data[0].values[0].x === 'number'){
        var start = Math.min(this.data[0].values[0].x,this.data[1].values[0].x); // To hours
        var finish = Math.min(this.data[0].values[this.data[0].values.length - 1].x,this.data[1].values[this.data[1].values.length - 1].x); // To hours
      }
    }
    var diff = 2 * 60 * 60;
    if((finish - start) > (72 * 60 * 60)){
      diff = (24 * 60 * 60);
    }else if((finish - start) > (24 * 60 * 60)){
      diff = (12 * 60 * 60);
    }

    this._chart.xAxis
      // .domain([start,finish])
      .tickValues(_.range(start, finish, diff))
    ;
  },


  //CÓIDGO DE PRUEBA PARA DIBUJAR UNA LÍNEA POR ENCIMA DE LOS PUNTOS, NO BORRAR !!

  // _drawChart:function(){
  //   App.View.Widgets.Charts.Base.prototype._drawChart.call(this);
  //   var data = [
  //     [0, 19.3],
  //     [39600, 81.4],
  //     [82800, 63.7],
  //   ];

  //   var x = d3.scale.linear()
  //       .domain([0, d3.max(data, function (d) {return d[0];})])
  //       .range([0, 1030]);

  //   var y = d3.scale.linear()
  //           .domain([0, 100])
  //           .range([220, 0]);




  //   var line = d3.svg.line()
  //     .x(function(d){return x(d[0]);})
  //     .y(function(d){return y(d[1]);})
  //     .interpolate("linear");

  //   var g = d3.select(this.$('.nv-groups')[0]).append('g');

  //   g.append("path")
  //   .attr("d", function(d) { return line(data)})
  //   .attr("transform", "translate(0,0)")
  //   .style("stroke-width", 2)
  //           .style("stroke", "steelblue")
  //           .style("fill", "none")
  //   ;

  // }

});
