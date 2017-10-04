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

App.View.Widgets.Charts.Line = App.View.Widgets.Charts.Base.extend({

_initChartModel: function(){
    this._chart = nv.models.lineChart()
        .showLegend(!this.options.get('hideLegend'))
        .color(this._colors)
        .margin({'bottom':15})
        .height(270)
        .useInteractiveGuideline(true)
        .noData(__(this.options.get('noDataMessage')))
    ;
  },

  _processData: function(){
    this._colors = this.options.get('colors');
    this.data = [];
    var _this = this;
    _.each(this.collection.toJSON(), function(elem) {
      var index = 0;
      _.each(elem.data, function(value,key) {
        if(_this.data[index] == undefined){
          _this.data[index] = {
            key:_this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key) ? _this.options.get('legendNameFunc')(key) : key,
            values:[],
            classed: _this.options.get('lineClassFunc') && _this.options.get('lineClassFunc')(key) ? _this.options.get('lineClassFunc')(key) : key,
          }
        }
        // TODO: DELETE THIS CONVERSION
        _this.data[index].values.push({x:new Date(elem.time),y:value})
        index ++;
      });
    });
  }

});

App.View.Widgets.Charts.ScatterLine = App.View.Widgets.Charts.Line.extend({
  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    this.data = [];
    var _this = this;

    _.each(this.collection.toJSON(), function(c, index) {
      for(var key in c){
        var item = {
          realKey: key,
          key: _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key) ? _this.options.get('legendNameFunc')(key) : key,
          values: c[key],
          classed: _this.options.get('lineClassFunc') && _this.options.get('lineClassFunc')(key) ? _this.options.get('lineClassFunc')(key) : key,
        };
        _this.data.push(item);
      }
    });
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
});
