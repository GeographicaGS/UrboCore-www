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
