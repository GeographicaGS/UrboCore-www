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

App.View.WidgetVariableLineChart = App.View.WidgetVariable.extend({
  
  initialize: function(options) {

    var sin = [];

    for (var i = 0; i < 100; i++) {
      sin.push({x: i, y:i});
    }

    this._data = [
                    {
                      key:'prueba',
                      values: sin,
                      color: '#00d5e7'
                    }
                  ];

    this.render();

  },

  onClose: function(){
    this.stopListening();        
  },

  render: function(){
    this.setElement(this._template());
    this.$('.widget_content').append('<svg class="chart"></svg>');

    var chart = nv.models.lineChart()
                  .useInteractiveGuideline(false)
                  .interactive(false)
                  .showLegend(false)
                  .margin({"left":35})
                ;

    chart.xAxis
          .tickFormat(d3.format(',r'))
          // .showMaxMin(false)
    ;

    chart.yAxis
          .tickFormat(App.d3Format.numberFormat('s'))
          // .showMaxMin(false)
    ;

    // d3.select(this.$('.chart')[0])
    
    var _this = this;
    setTimeout(function(){

    d3.select(_this.$('.chart')[0])
      .datum(_this._data)
      .call(chart)
    ;

    }, 100);
  

    

    return this;
  }

});
