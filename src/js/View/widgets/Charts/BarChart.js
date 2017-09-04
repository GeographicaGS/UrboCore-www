'use strict';

/*
 * initialize own options:
 *  - stacked (Boolean, optional) Default: false
 *  - multilineXLabel (Boolean, optional) Default: false
 *  - disableClick (Boolean, optional) Default: true
 */
App.View.Widgets.Charts.Bar = App.View.Widgets.Charts.Base.extend({

  initialize: function(options){
    if(!options.opts.has('stacked')) options.opts.set({stacked: false});
    if(!options.opts.has('multilineXLabel')) options.opts.set({multilineXLabel: false});
    if(!options.opts.has('disableClick')) options.opts.set({disableClick: true});
    _.bindAll(this, '_adjustXAxis');
    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);
  },

  _drawChart: function(){
    var _this = this;
    this.graph = nv.addGraph({
        generate: function() {
          App.View.Widgets.Charts.Base.prototype._drawChart.call(_this);
          _this._drawExtra();
        },
        callback: function() {
          if(_this.options.get('multilineXLabel')){
            _this._adjustXAxis();
          }

          if(_this.options.get('disableClick')){
            if(_this._chart.discretebar) _this._chart.discretebar.dispatch.elementClick = undefined;
            if(_this._chart.multibar) _this._chart.multibar.dispatch.elementClick = undefined;
          }

          return true;
        }
    });
  },

  _initChartModel: function(){
    this._chart = nv.models.multiBarChart()
        .showControls(false)
        .showLegend(!this.options.get('hideLegend'))
        .stacked(this.options.get('stacked'))
        .groupSpacing(0.3)
        .reduceXTicks(true)
        .staggerLabels(false)
        .color(this._colors)
        .margin({'bottom':15})
        .height(270)
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.yAxis.tickPadding(10);
  },

  _adjustXAxis: function(){
    var _this = this;
    var width = _this._chart.xAxis.rangeBand();
    d3.select(this.$('.nv-x')[0])
      .selectAll('text')
      .each(function(d,i){
        _this.insertLinebreaks(this, d, width );
      });

    this._chart.update();
  },

  _formatYAxis: function(){
    // Get max value
    var maxVals = [];
    if(!this.options.get('stacked')){
      _.each(this.data, function(data){
        maxVals.push(_.max(data.values, function(el){ return el.y }).y);
      });
      var max = Math.max.apply(null, maxVals);
    }else{
      _.each(this.data, function(data){
        _.each(data.values, function(el, idx){
          maxVals[idx] = maxVals[idx] ? maxVals[idx] + el.y : el.y;
        });
      });
      var max = Math.max.apply(null, maxVals);
    }

    var yDomain = this.options.get('yAxisDomain') || [0, 5];
    if(max > yDomain[1]) yDomain[1] = max;

    var diff = Math.ceil((yDomain[1] - yDomain[0]) / 5);

    var yInterval = [];
    var nextVal = yDomain[0];
    do {
      yInterval.push(nextVal);
      nextVal += diff;
    }while(yDomain[1] > nextVal);

    this._chart.yAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('yAxisShowMaxMin') ? this.options.get('yAxisShowMaxMin'): true)
      .tickFormat(this.options.get('yAxisFunction'))
      .domain(yDomain)
      .tickValues(yInterval)
    ;
  },

  insertLinebreaks: function (t, d, width) {
    var el = d3.select(t);
    var p = d3.select(t.parentNode);
    p.append("foreignObject")
        .attr('x', -width/2)
        .attr("width", width)
        .attr("height", 200)
      .append("xhtml:p")
        .attr('style','word-wrap: break-word; text-align:center;')
        .html(d);

    el.remove();
  },

  _drawExtra: function(){
    // Top line
    var svg = d3.select(this.$('.chart .nv-axis.nv-y .nv-wrap > g .tick line')[0]);
    if(svg.node()){
      var lineBBox = svg.node().getBBox();
      d3.select(this.$('.chart .nv-axis.nv-y .nv-wrap > g')[0]).append('line')
      .attr({
          x1: 0,
          y1: 0,
          x2: lineBBox.width,
          y2: 0
      });
    }
  }

});

App.View.Widgets.Charts.HorizontalBar = App.View.Widgets.Charts.Bar.extend({
  _initChartModel: function(){
    this._chart = nv.models.multiBarHorizontalChart()
        .showControls(false)
        .showLegend(!this.options.get('hideLegend'))
        .stacked(this.options.get('stacked'))
        .groupSpacing(0.3)
        .color(this._colors)
        .margin({'bottom':15})
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.yAxis.tickPadding(10);
  },
});

/*
 * initialize own options:
 *  - multilineXLabel (Boolean, optional) Default: false
 */
App.View.Widgets.Charts.SimpleBar = App.View.Widgets.Charts.Bar.extend({
  initialize: function(options){
    if(!options.opts.has('multilineXLabel')) options.opts.set({multilineXLabel: false});
    App.View.Widgets.Charts.Bar.prototype.initialize.call(this,options);
  },

  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');
    var skipUnvalued = this.options.get('skipUnvalued');
    // Format data
    this.data = [];
    var element = {
      key: 'data',
      values: []
    };
    var _this = this;
    _.each(this.collection.toJSON(), function(elem) {
      if(elem.value || (!elem.value && !skipUnvalued)) {
        element.values.push({
          realKey: elem.name,
          key: _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.name) ? _this.options.get('legendNameFunc')(elem.name) : elem.name,
          y: parseFloat(elem.value) || 0
        });
      }
    });
    this.data.push(element);
  },

  _initChartModel: function(){
    this._chart = nv.models.discreteBarChart()
        .x(function(d){ return d.key; })
        .showLegend(!this.options.get('hideLegend'))
        .staggerLabels(false)
        .color(this._colors)
        .height(270)
        .width(300)
        .margin({'bottom':15})
        .duration(250)
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.yAxis.tickPadding(10);
  },

  _initLegend: function(){
    if(!this.options.get('hideLegend')){
      this.$('.var_list').html(
        typeof this._list_variable_template == 'function' ?
          this._list_variable_template({
            colors: this.options.get('colors') ? this.options.get('colors') : d3.scale.category20().range(),
            classes: this.options.get('classes'),
            data : this.data[0].values,
            disabledList: this._internalData.disabledList,
          })
          :
          this._list_variable_template
      );

       // this.$('.var_list').html(this._list_variable_template);

      this._chart.legend.margin({bottom: 20});
      this.$(".nv-legendWrap.nvd3-svg").hide();
    }else{
      this._chart.margin({top: 40});
    }
  },
});
