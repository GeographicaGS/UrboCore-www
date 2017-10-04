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

App.View.WidgetVariableBarChart = App.View.WidgetVariable.extend({
  
  initialize: function(options) {

    this.url = '';
  	this.title = '';
  	this.category_name = '';
  	this._data = [];
    this.render();
  },

  onClose: function(){
    this.stopListening();        
  },

  render: function(){
    this.setElement(this._template({
      'url': this.url,
    	'title':this.title,
    	'category_name': this.category_name
    }));
    this.$('.widget_content').append('<svg class="chart ' + (this.class ? this.class:'') + '"></svg>');

    return this;
  },


  _drawChart:function(){
    var _this = this;
    var chart = nv.models.multiBarHorizontalChart()
         .x(function(d) { return d.label })
         .y(function(d) { return d.value })
         .showControls(false)
         .showLegend(false)
         .margin({'top':0})
         .barColor([this.barColor ? this.barColor:"#00d5e7"])
         .groupSpacing(this.groupSpacing ? this.groupSpacing:0.5)
    ;

    chart.yAxis.ticks(5).showMaxMin(false).tickFormat(App.d3Format.numberFormat('s'));
    d3.select(_this.$('.chart')[0])
      .datum(_this._data)
      .call(chart)
    ;

    this.$('.widget_loading').remove();
    // this.$(".widget .chart .nv-y .nvd3 text").remove();
  }

});
