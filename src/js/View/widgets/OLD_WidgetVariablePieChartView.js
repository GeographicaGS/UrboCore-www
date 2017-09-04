'use strict';

App.View.WidgetVariablePieChart = App.View.WidgetVariable.extend({
  
  initialize: function(options) {

    var sin = [];

    for (var i = 0; i < 100; i++) {
      sin.push({x: i, y:i});
    }

    this._data = [
			      {
			        "label": "One",
			        "value" : 29.76
			      } ,
			      {
			        "label": "Three",
			        "value" : 32.80
			      } ,
			      {
			        "label": "Four",
			        "value" : 196.45
			      } ,
			      {
			        "label": "Five",
			        "value" : 0.19
			      } ,
			      {
			        "label": "Six",
			        "value" : 98.07
			      } ,
			      {
			        "label": "Seven",
			        "value" : 13.92
			      } ,
			      {
			        "label": "Eight",
			        "value" : 5.13
			      }
			];

    this.render();

  },

  onClose: function(){
    this.stopListening();        
  },

  render: function(){
  	var _this = this;
    this.setElement(this._template());
    this.$('.widget_content').append('<svg class="chart"></svg>');

 	var chart = nv.models.pieChart()
			    .x(function(d) { return d.label })
			    .y(function(d) { return d.value })
		    	.showLegend(false)
		    	.donut(true)
		    	.donutRatio(0.6)
		    	.labelType("value")
		    	.labelsOutside(true)
		    	.valueFormat(App.d3Format.numberFormat('s'))
		    	// .color(['#00d5e7'])
		    	.color(function (d, i) {
				    return d3.rgb('#00d5e7').darker(i/2.3);
				})
	;


    // chart.yAxis
    //       .tickFormat(App.d3Format.numberFormat(',.2r'))
    // ;

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
