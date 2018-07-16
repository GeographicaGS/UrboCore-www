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

/*
 * initialize own options:
 *  img (String, optional) path to an image to place in the middle of the chart
 *  showTotal (Boolean, optional) Shows the total value in the middle of the chart, below the image. Default: false
 *  showLabels (Boolean, optional) Shows the labels outside the chart. Default: false
 */
App.View.Widgets.Charts.Pie = App.View.Widgets.Charts.Base.extend({
  _template: _.template( $('#chart-pie_context_chart').html() ),

  initialize: function(options){
    if(!options.opts.has('img')) options.opts.set({img: ''});
    if(!options.opts.has('showTotal')) options.opts.set({showTotal: false});
    if(!options.opts.has('showLabels')) options.opts.set({showLabels: false});
    _.bindAll(this,'_centerChart');
    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);
  },

  _drawChart: function(){
    App.View.Widgets.Charts.Base.prototype._drawChart.call(this);
    this._drawExtra();
  },

  _processData: function(){
    // Extract colors
    this._colors = this.options.get('colors');

    // Format data
    this.data = [];
    var _this = this;
    _.each(this.collection.toJSON(), function(elem) {
      _this.data.push({
        key: _this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.name) ? _this.options.get('legendNameFunc')(elem.name) : elem.name,
        y: parseFloat(elem.value) || 0
      });
    });
  },

  _initChartModel: function(){
    this._chart = nv.models.pieChart()
        .x(function(d){ return d.key; })
        .showLegend(false)
        .color(this._colors)
        .donut(true)
        .donutRatio(0.62)
        .showLabels(this.options.get('showLabels'))
        .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
        .labelType("value")
        .labelsOutside(true)
        .labelFormat(this.options.get('yAxisFunction') ? this.options.get('yAxisFunction') : App.nbf)
        .height(320)          //Force height
        .growOnHover(false)
        .noData(this.options.get('noDataMessage'))
    ;

    this._chart.dispatch.on('renderEnd', this._centerChart); // Force center on each refresh
  },

  _initTooltips: function(){
    if(!this.options.get('hideTooltip')){
      var _this = this;
      if(!this.options.get('tooltipFunc')){
        this._chart.tooltip.contentGenerator(function(obj){
          var total = _.reduce(_this.data, function(sum, elem){ return sum + elem.y; }, 0);
          var templateData = {
            data: obj,
            utils: {
              total: total
            }
          };
          if(_this.xAxisFunction){
            templateData.utils.xAxisFunction = _this.xAxisFunction;
          }
          if(_this.options.get('yAxisFunction')){
            templateData.utils.yAxisFunction = _this.options.get('yAxisFunction');
          }
          return _this._template_tooltip(templateData);
        });
      }else{
        this._chart.tooltip.contentGenerator(this.options.get('tooltipFunc'));
      }
    }else{
      this._chart.tooltip.classes(['hide']);
    }
  },

  _centerChart: function(){
    d3.select(this.$('.nvd3.nv-wrap.nv-pieChart')[0]).attr('transform', 'translate(20,0)');
  },

  _drawExtra: function() {
    var svg = d3.select(this.$('.chart')[0]);
    var svgNode = svg.node();
    var clientSize = svgNode.getClientRects();
    if(clientSize){
      // Draw icon
      if(this.options.get('img')){
        var logoSize = { height: 32, width: 32 };
        var logoOffset = { top: 5, left: 0 };

        if(this.options.get('showTotal'))
          logoOffset.top = 20;

        svg.insert('svg:image', '.nv-wrap')
              .attr('xlink:href', this.options.get('img'))
              .attr('x', clientSize[0].width / 2)
              .attr('y', clientSize[0].width / 2)
              .attr('height', logoSize.height + 'px')
              .attr('width', logoSize.width + 'px')
              .attr('transform', 'translate(-' + (logoSize.width / 2 + logoOffset.left) +
                ',-' + (logoSize.height + logoOffset.top) + ')');
      }

      // Draw total
      if(this.options.get('showTotal')){
        var valueOffset = { top: 35, left: 0 };
        if(this.options.get('img'))
          valueOffset.top = 15;
        var total = _.reduce(this.data, function(sum, elem){ return sum + elem.y; }, 0);
        var valueFunc = this.options.get('yAxisFunction') ? this.options.get('yAxisFunction') : App.nbf;

        var textEl = svg.insert('foreignObject', '.nv-wrap')
            .attr('x', clientSize[0].width / 4)
            .attr('y', clientSize[0].height / 2)
            .attr('width', clientSize[0].width / 2)
            .attr('height', clientSize[0].height / 4)
            .attr('transform', 'translate(-' + valueOffset.left +
              ',-' + valueOffset.top + ')')
          .append('xhtml:p')
            .attr('class','extraContent')
            .html(__('Total') + ' ');

        textEl.append('xhtml:span')
          .html(valueFunc(total));

        // if(!this.options.get('img')){
        //   textEl.attr('style','transform: translate(0,0)')
        // }
      }
    }
  }
});
