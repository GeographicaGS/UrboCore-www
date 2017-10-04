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

App.View.Widgets.MultiVariableStackedChart = Backbone.View.extend({
  _template: _.template( $('#widgets-widget_multiVariable_stackedchart').html() ),
  _template_popup: _.template( $('#chart-stackbarPopupTemplate').html() ),

  initialize: function(options) {

    _.bindAll(this,'_zoomed','_nextPage', '_prevPage','_goToFirstData','_drawPaginationControls','_updatePaginationControls','showPopup');

    this.model = options.model;
    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this.listenTo(this.collection,"reset",this._drawChart);
    this.collection.fetch({'reset':true});

    if(this._stepModel){
      this.collection.options.step = this._stepModel.get('step');
      this.listenTo(this._stepModel,"change:step",function(){
        this.collection.options.step = this._stepModel.get('step');
        this.collection.fetch({'reset':true});
        this.render();
      });
    }

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      this.render();
      this.$('.widget').addClass('active');
      this.collection.fetch({'reset':true});
      this.$('.loading.widgetL').removeClass('hiden');
    });

    if(this.model.get('popupTemplate')){
      this._template_popup = _.template($(this.model.get('popupTemplate')).html());
    }

    this.render();
  },


  onClose: function(){
    this.stopListening();
  },

  events: {
    'click .popup_widget.step li': '_changeStep'
  },

  render: function(){
    this.$el.html(this._template({
      'm':this.model.toJSON(),
      's':this._stepModel ? this._stepModel.toJSON():null
    }));
    this.$title = this.$('.widget_header h3 + span');

    // Fix old widgets (Andalucia)
    this.$('.widget_content').html('<div class="popup_wrapper nvtooltip xy-tooltip"></div><svg class="chart popup_enable stackedbars"></svg>');

    this.$('.widget').append(App.widgetLoading());
    return this;
  },

  _drawChart:function(){
    this.$('.loading.widgetL').addClass('hiden');
    d3.select(this.$('svg')[0]).selectAll('.nv-bar').on('mousemove',null);
    d3.select(this.$el[0]).on('mouseleave',null);

    this._availableWidth = 1;
    this._numTicks = 10;
    this._container = d3.select(this.$('.chart')[0]);
    this._xScale = d3.time.scale();

    if(this.collection.toJSON().length == 0){
      this.$('.chart').html('')
      return true;
    }

    var data = [];
    var _this = this;
    this._firstData = null;

    var max = _.max(this.collection.toJSON(), function(c){
      return c.elements.length;
    }).elements.length;
    this._colors = max > this.model.get('maxColors') ? [this.model.get('colors')[0]]:this.model.get('colors');

    var processedData = this.extractData(this.collection, this.model, max);
    data = processedData.data;
    this._firstData = processedData.firstData;

    if(this.model.get('zoomEnable') && data[0].values.length > 5){
      this.$('.chart').width(65.6 * data[0].values.length)
    }

    this._chart = nv.models.multiBarChart()
        .showControls(false)
        .showLegend(this.model.get('showLegend'))
        .stacked(true)
        .groupSpacing(0.3)
        .reduceXTicks(true)
        .color(this._colors)
        .margin({'bottom':15})
        // .margin({'top':10, 'left':30})
        // .margin({'top':10})
        // .yDomain([0,max + 10])
        .height(260)
    ;

    this._chart.tooltip.classes(['hide']);
    if(this.model.get('showLegend')){
      this._chart.legend.margin({'bottom': 15, 'top': 9});
      this._chart.legend._maxKeyLength(50);
    }

    this._chart.yAxis.ticks(5).showMaxMin(false).tickFormat(App.d3Format.numberFormat('s'));
    this.formatXAxis(data[0].values.length);

    var marginTop = 10;
    if(this.model.get('zoomEnable'))
      marginTop = 30;
    if(this.model.get('yAxisLabel')){
      this._chart.yAxis.axisLabel(this.model.get('yAxisLabel'));
      this._chart.yAxis.axisLabelDistance(-10);
      this._chart.margin({'top':marginTop, 'left':50});
    }else{
      this._chart.margin({'top':marginTop, 'left':30});
    }

    d3.select(this.$('.chart')[0])
        .datum(data)
        .call(this._chart);


    if(this.model.get('zoomEnable')){
      this._drawPaginationControls();
      this._zoomPan(this._chart);
      this._lastX = 0;
      this._lastScale = 1;
      this._chartHeight = d3.select(this.$('.nv-barsWrap')[0]).node().getBBox().height;
      this._pageWidth = this.$('.widget_content').width() - 50; // Y axis width offset = 50
      this._chartTotalWidth = this.$('.chart').width() * -1;
      this._updatePaginationControls();
    }

    if(!this.model.get('hideTooltip')){
      d3.select(this.$('svg')[0]).selectAll('.nv-bar').on('mousemove', this.showPopup);

      d3.select(this.$el[0]).on('mouseleave', function(e){
        _this.$('.popup_stackbar').removeClass('active');
      });
    }

    if(this.model.get('yAxisAdjust')){
      this._chart.forceY(this._chart.yAxis.scale().domain());
    }

    if(this.model.get('centerLegend')){
      this._centerLegend();
    }


    return this;
  },

  extractData: function(collection, configModel, max) {
    var data = [];
    var firstData;

    for(var i=0; i<max; i++){
      data.push({'values':[]});
      if(configModel.get('legend')){
        data[i]['key'] = configModel.get('legend')[i];
      }
      _.each(collection.toJSON(), function(elem) {
        var value = 0;
        if(i<elem.elements.length){
          var key = Object.keys(elem.elements[i])[0];
          value = elem.elements[i][key];
          if(value > 0 && firstData == null){
            firstData = elem.step;
          }
        }
        data[i]['values'].push({'x': elem.step, 'y': value });
      });
    }

    return {
      data: data,
      firstData: firstData
    };
  },

  formatXAxis: function(numTicks){
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(false)
      .tickFormat(this.model.get('xAxisFunction'))
      .axisLabel(this.model.get('xAxisLabel'));
  },

  showPopup: function(e){
    var current = _.findWhere(this.collection.toJSON(), {step: e.x});
    this.$('.widget_content .popup_wrapper').html(this._template_popup({'m':this.model, 'elements':current.elements, 'colors':this._colors}))
    if(!this.$('.popup_stackbar').hasClass('active')){
      this.$('.popup_stackbar').addClass('active');
      this.$('.popup_stackbar').css({'transform':'translate(' + d3.event.clientX + 'px,' + d3.event.clientY + 'px)'})
    }
  },

  _updateAvailableWidth: function(){
    this._availableWidth = (this._chart.width() || parseInt(this._container.style('width')) || 960) - this._chart.margin().left - this._chart.margin().right;
  },

  _zoomPan:function(){
    var scaleExtent = [1, 4];
    var d3zoom = d3.behavior.zoom()
                    .scaleExtent(scaleExtent)
                    .on('zoom', this._zoomed);

    d3.select(this._chart.container).call(d3zoom).on('dblclick.zoom', null);
  },

  _zoomed:function(){
    this._lastX += d3.event.sourceEvent.movementX;
    this._lastScale = d3.event.scale;
    this._movePage(false);
  },

  _centerLegend:function(){
    if(this.model.get('showLegend')){
      var yTranslate = d3.transform(d3.select(this.$('.nv-legendWrap')[0]).attr('transform')).translate[1];
      var chartWidth = d3.select(this.$('.chart')[0]).node().getBBox().width;
      var legendWidth = d3.select(this.$('.nv-legendWrap')[0]).node().getBBox().width;
      var margin = 50;
      d3.select('.nv-legendWrap').attr('transform', 'translate(-' + (chartWidth/2 - legendWidth/2 - margin) + ',' + yTranslate + ')');
			this._chart.legend.margin().right = (chartWidth/2 - legendWidth/2 - margin);
    }
  },


  // Pagination methods

  // Draws the pagination controls
  _drawPaginationControls: function(){
    var chartContainer = this.$('.widget_content');
    var chartWidth = chartContainer.width();
    var chartHeight = chartContainer.height();

    if(this.$('.chart #arrow_next').length === 0){

      d3.select(this.$('.chart')[0])
        .append('svg:pattern')
          .attr("id", "arrow_next")
          .attr("width", 24)
          .attr("height", 24)
          .attr("patternUnits", "objectBoundingBox")
        .append("svg:image")
          .attr("xlink:href", '/img/SC_ic_flecha-avanzar.svg')
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", 2)
          .attr("y", 2);

      this._nextButton = d3.select(this.$('.chart')[0])
        .append('circle')
          .attr('cx', chartWidth - 15)
          .attr('cy', 13)
          .attr('r', 12)
          .attr('fill', 'url(#arrow_next)')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 1)
          .attr('class', 'button')
          .on('click', this._nextPage);

      this._prevButton = d3.select(this.$('.chart')[0])
        .append('circle')
          .attr('cx', (chartWidth - 50) * -1)
          .attr('cy', -13)
          .attr('r', 12)
          .attr('fill', 'url(#arrow_next)')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 1)
          .attr('class', 'button')
          .attr('transform', 'rotate(180)')
          .on('click', this._prevPage);

      d3.select(this.$('.chart')[0])
        .append('svg:pattern')
          .attr("id", "arrow_forward")
          .attr("width", 150)
          .attr("height", 20)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("patternTransform", "translate(155,1)")
        .append("svg:image")
          .attr("xlink:href", '/img/SC_ic_flecha-saltar.svg')
          .attr("width", 18)
          .attr("height", 18)
          .attr("x", 2)
          .attr("y", 2);

      this._firstDataButton = d3.select(this.$('.chart')[0])
        .append('g')
          .attr('class', 'forwardButton')
          .on('click', this._goToFirstData);
      this._firstDataButton.append('rect')
          .attr('x', (chartWidth - 50) / 2 + 50)
          .attr('y', (chartHeight - 15) / 2 + 15)
          .attr('width', 150)
          .attr('height', 20)
          .attr('transform', 'translate(-75,-20)')
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('stroke', '#00b8c7')
          .attr('stroke-width', 1)
          .attr('fill', 'url(#arrow_forward)');
      this._firstDataButton.append('text')
          .attr('x', (chartWidth - 50) / 2 + 50 - 10) // Y axis width offset - button icon offset
          .attr('y', (chartHeight - 15) / 2 + 15) // X axis height offset
          .attr('height', 20)
          .attr('transform', 'translate(0,-6)')
          .attr('text-anchor', 'middle')
          .text('Saltar a los datos');
    }
  },

  // Go to next page
  _nextPage:function(){
    if(this._lastX - this._pageWidth > this._chartTotalWidth + this._pageWidth){
      this._lastX -= this._pageWidth;
    }else{
      this._lastX = this._chartTotalWidth + this._pageWidth;
    }
    this._movePage();
  },

  // Go to previous page
  _prevPage:function(){
    if(this._lastX + this._pageWidth < 0){
      this._lastX += this._pageWidth;
    }else{
      this._lastX = 0;
    }
    this._movePage();
  },

  // Forwards to first data
  _goToFirstData: function(){
    var firstDataItem = this.$('.chart .nv-axis.nv-x text:contains('+ this.model.get('xAxisFunction')(this._firstData) +')').last();
    this._lastX += firstDataItem.offset().left * -1 + this._pageWidth * 3; // TODO: Improve
    this._movePage();
  },

  // Applies the page movement
  _movePage: function(transitionEnabled){
    transitionEnabled = typeof transitionEnabled !== 'undefined' ? transitionEnabled : true;

    this._chartHeight = d3.select(this.$('.nv-barsWrap')[0]).node().getBBox().height;
    var leftWidth = this.$('.chart').width() - 26 - d3.transform(this.$('.nv-multiBarWithLegend').attr("transform")).translate[0];
    var transitionDuration = 200;
    if(!transitionEnabled)
      transitionDuration = 0;

    d3.selectAll(this.$('.nv-group').toArray())
      .transition()
      .duration(transitionDuration)
      .attr('transform', 'translate(' + this._lastX +',0)scale('+ this._lastScale+',1)');
    d3.select(this.$('.nv-x')[0])
      .transition()
      .duration(transitionDuration)
      .attr('transform', 'translate(' + this._lastX +','+ this._chartHeight + ')')
      .each('end', this._updatePaginationControls)
      .call(this._chart.xAxis.scale(this._chart.xAxis.scale().rangeRoundBands([0, leftWidth * this._lastScale],.1 * this._lastScale)));
  },

  // Updates the pagination controls status
  _updatePaginationControls: function(){
    // Pagination buttons
    if(this._lastX < 0)
      this._prevButton.node().classList.remove('disabled');
    else
      this._prevButton.node().classList.add('disabled');
    if(this._lastX > this._chartTotalWidth + this._pageWidth)
      this._nextButton.node().classList.remove('disabled');
    else
      this._nextButton.node().classList.add('disabled');

    // Forward to data button
    var firstDataItem = this.$('.chart .nv-axis.nv-x text:contains('+ this.model.get('xAxisFunction')(this._firstData) +')').last();
    if(firstDataItem.offset().left * -1 + this._pageWidth * 3.5 >= 0){
      this._firstDataButton.node().classList.add('hide');
    }else{
      this._firstDataButton.node().classList.remove('hide');
    }
  },

  _changeStep:function(e){
    e.preventDefault();
    var step = $(e.currentTarget).attr('data-step');
    this._stepModel.set('step',step)
  }
});
