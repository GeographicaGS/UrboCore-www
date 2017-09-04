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
