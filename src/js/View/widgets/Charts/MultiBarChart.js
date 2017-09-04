'use strict';
/*
 * NOTICE: Right now, this chart is focused on time related data, so the X axis data should be a date or a datetime.
 */
App.View.Widgets.Charts.MultiBarChart = App.View.Widgets.Charts.Bar.extend({
  _template: _.template( $('#chart-base_context_chart').html() ),

  events: _.extend({
    'click .popup_widget.step .varsel li': '_changeStep'
  }, App.View.Widgets.Charts.Bar.prototype.events),

  initialize: function(options){
    if(!options.opts.has('multilineXLabel')) options.opts.set({multilineXLabel: true});
    App.View.Widgets.Charts.Bar.prototype.initialize.call(this,options);
  },

  render: function(){
    this.options.set('stepsAvailable', App.Utils.getStepsAvailable());
    App.View.Widgets.Charts.Bar.prototype.render.call(this);
    return this;
  },

  // _drawChart: function(){
  //   App.View.Widgets.Charts.Base.prototype._drawChart.apply(this);
  // },

  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    var max = _.max(this.collection.toJSON(), function(c){
      return c.data.length;
    }).data.length;
    this.data = [];
    var _this = this;
    var timeFormatter = d3.time.format.iso;
    for(var i=0; i<max; i++){
      this.data.push({'values':[]});
      _.each(this.collection.toJSON(), function(elem) {
        var value = 0;
        if(i<elem.data.length){
          var key = Object.keys(elem.data[i])[0];
          value = elem.data[i][key];
          key += i.toString()
        }
        if(_this.data[i]['key'] === undefined)
          _this.data[i]['key'] = _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(key) ? _this.options.get('legendNameFunc')(key) : key;
        _this.data[i]['realKey'] = key;
        _this.data[i]['values'].push({'x': timeFormatter.parse(elem.time), 'y': parseFloat(value) });
        // _this.data[i]['values'].push({'x': elem.time, 'y': parseFloat(value) });
      });
    }
  },

  _initChartModel: function(){
    this._chart = nv.models.multiBarChart()
        .showControls(false)
        .showLegend(!this.options.get('hideLegend'))
        .stacked(this.options.get('stacked'))
        .groupSpacing(.5)
        .color(this._colors)
        .margin({'bottom':15})
        .height(270)
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.yAxis.tickPadding(10);
  },

  _formatXAxis: function(){
    var numElems = this.data[0] && this.data[0].values ? this.data[0].values.length : 0;
    this._xScale = d3.time.scale();
    this._container = d3.select(this.$('.chart')[0]);
    this._availableWidth = (this._chart.width() || parseInt(this._container.style('width')) || 960) - this._chart.margin().left - this._chart.margin().right;

    this._xScale.rangeBands = this._xScale.range;
    var _this = this;
    this._xScale.rangeBand = function(){
      return Math.max((1 - _this._chart.groupSpacing()) * _this._availableWidth / numElems, 2);
    };
    this._chart.multibar.xScale(this._xScale);
    // this._chart.xScale(this._xScale);
    var dateOptions = this.collection.options.data.time;
    this._chart.xDomain([moment(dateOptions.start).toDate(),moment(dateOptions.finish).toDate()]);
    this._chart.xAxis
      .tickPadding(5)
      .tickFormat(this.xAxisFunction)
      .axisLabel(this.options.get('xAxisLabel'))
      // .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin'): true)
    ;
  },

  _adjustXAxis: function(){
    this._chart.update();

    var _this = this;
    var width = _this._chart.xAxis.rangeBand();
    var ticks = d3.select(this.$('.nv-x')[0]).selectAll('.tick text,.tick foreignObject');
    ticks.each(function(d,i){
      _this.insertLinebreaks(this, d, width );
    });
  },

  insertLinebreaks: function (t, d, width) {
    var el = d3.select(t);
    var p = d3.select(t.parentNode);
    p.append("foreignObject")
        .attr("width", width)
        .attr("height", 200)
      .append("xhtml:p")
        .attr('style','white-space: wrap; text-align:center;')
        .html(this.xAxisFunction ? this.xAxisFunction(d) : d);

    el.remove();
  }
});
