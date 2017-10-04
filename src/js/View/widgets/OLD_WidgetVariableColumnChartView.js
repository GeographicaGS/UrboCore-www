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

App.View.WidgetVariableColumnChart = App.View.WidgetVariable.extend({
  
  initialize: function(options) {

    var sin = [];

    for (var i = 0; i < 100; i++) {
      sin.push({x: i, y:i});
    }

    this._data = [
		  {
		    key: "Cumulative Return",
		    values: [
		      { 
		        "label" : "A" ,
		        "value" : 29.765957771107
		      } , 
		      { 
		        "label" : "B" , 
		        "value" : 0
		      } , 
		      { 
		        "label" : "C" , 
		        "value" : 32.807804682612
		      } , 
		      { 
		        "label" : "D" , 
		        "value" : 196.45946739256
		      } , 
		      { 
		        "label" : "E" ,
		        "value" : 0.19434030906893
		      } , 
		      { 
		        "label" : "F" , 
		        "value" : 98.079782601442
		      } , 
		      { 
		        "label" : "G" , 
		        "value" : 13.925743130903
		      } , 
		      { 
		        "label" : "H" , 
		        "value" : 5.1387322875705
		      }
		    ]
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

 	var chart = nv.models.multiBarChart()
			    .x(function(d) { return d.label })
			    .y(function(d) { return d.value })
			    .staggerLabels(false)
			    .showControls(false)
			    .showLegend(false)
			    .margin({"left":35})
			    .barColor(["#00d5e7"])
			    .groupSpacing(0.5)
	;


    chart.yAxis
          .tickFormat(App.d3Format.numberFormat('s'))
    ;

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
