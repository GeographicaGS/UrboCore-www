'use strict';

App.View.Map.ComparisonLegend = Backbone.View.extend({

  initialize: function(options) {
    this.options = options;
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    var data = [];
    if(this.options.variable.legendData != undefined) {
      var min = this.options.variable.legendData.min;
      var max = this.options.variable.legendData.max;
      data.push({ value: min });
      data.push({ value: max });
    }

    _.each(this.options.rampColor, function(color, index) {
      data.push({name:'color' + index, value:color});
    });

    var choropleth = new cdb.geo.ui.Legend({
       type: "choropleth",
       data: data
     });

    this.$el.html(choropleth.$el);
    return this;
  },
});
