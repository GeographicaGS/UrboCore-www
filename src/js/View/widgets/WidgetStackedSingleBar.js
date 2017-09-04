'use strict';

App.View.Widgets.StackedSingleBar = App.View.Widgets.Base.extend({
  _template_popup: _.template( $('#chart-stackbarPopupTemplate').html() ),

  initialize: function(options) {

    _.bindAll(this, "_onModelFetched", "_onCollectionReset");

    this.model = options.model;
    if(options.data instanceof Backbone.Model) {
      this.modelData = options.data;
      this.modelData.fetch({success:this._onModelFetched, data:this.modelData.options.data || {}})
    } else if(options.data instanceof Backbone.Collection) {
      this.collection = options.data;
      this.listenTo(this.collection, "reset", this._onCollectionReset);
      this.collection.fetch({'reset':true, data:this.collection.options.data || {}});
    }

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      this.render();
      this.$('.widget').addClass('active');
      if(this.modelData){
        this.modelData.fetch({success:this._onModelFetched, data:this.modelData.options.data || {}});
      } else if(this.collection) {
        this.collection.fetch({'reset':true, data:this.collection.options.data || {}});
      }
      this.$('.loading.widgetL').removeClass('hiden');
    });

    if(this.model.get('popupTemplate')){
      this._template_popup = _.template($(this.model.get('popupTemplate')).html());
    }

    this.render();
  },

  _onModelFetched: function() {
    var data = this.modelData.toJSON();
    this._drawChart([data]);
  },
  _onCollectionReset: function() {
    this._drawChart(this.collection.toJSON());
  },

  onClose: function(){
    this.stopListening();
  },

  events: {
    // 'click .chart .nv-series': '_centerLegend',
  },

  render: function(){
    var m = this.model.toJSON();
    this.$el.html(this._template({
      link:m.url?m.url:undefined,
      category:m.category,
      title:m.title
    }));

    // Fix old widgets (Andalucia)
    this.$('.widget_content').html('<div class="popup_wrapper nvtooltip xy-tooltip"></div><svg class="chart popup_enable stackedsinglebar"></svg>');

    this.$('.widget').append(App.widgetLoading());

    if(m.dateComponent) {
      var model = new Backbone.Model({
        botonLocationView:this.$(".botons")
      });
      this._renderDateComponent(model);
    }
    return this;
  },

  _drawChart:function(collection){
    this.$('.loading.widgetL').addClass('hiden');
    d3.select(this.$('svg')[0]).selectAll('.nv-bar').on('mousemove',null);
    d3.select(this.$el[0]).on('mouseleave',null);

    if(collection.length == 0){
      var content = this.model.get('noDataMessage')?this.model.get('noDataMessage'):'';
      this.$('.widget_content').html("<div class='noData dangerContainers'><div>" + content + "</div></div>");
      return true;
    }

    var data = [];
    var _this = this;

    var colors = this.model.get('colors');

    var _this = this;

    _.each(collection, function(elem, i) {
      data[i] = {};
      data[i]['values'] = [];
      data[i]['key'] = elem.name?elem.name:'key';
      data[i]['values'].push({'x':'name1', 'y': parseFloat(elem.value) });
    });

    if(this.model.get('zoomEnable') && data[0].values.length > 5){
      this.$('.chart').width(65.6 * data[0].values.length)
    }
    var maxValue = this.model.get('maxValue')?this.model.get('maxValue'):12;
    this._chart = nv.models.multiBarChart()
        .showControls(false)
        .showLegend(this.model.get('showLegend'))
        .stacked(true)
        .groupSpacing(0)
        .width(270)
        .margin({"left":45})
        .color(colors)
        .forceY([0,maxValue])
    ;

    var parseTooltip = this.model.get('parseTooltip');
    if(parseTooltip != undefined) {
      this._chart.tooltip.contentGenerator(function(data) {
        return parseTooltip(data);
      });
    }
    // this._chart.tooltip.classes(['hide']);
    if(this.model.get('showLegend'))
      this._chart.legend.margin({'bottom':20})

    var tickValues = [];
    var divisor = this.model.get('formatYAxis')?this.model.get('formatYAxis').numberOfValues?this.model.get('formatYAxis').numberOfValues:4:4;
    for(var i = 0; i < maxValue; i+=maxValue/divisor) {
      tickValues.push(i);
    }

    var functionTickFormat = function(d) {
      return App.d3Format.numberFormat('s')(d);
    };
    if(this.model.get('formatYAxis') && this.model.get('formatYAxis').tickFormat) {
      functionTickFormat = this.model.get('formatYAxis').tickFormat;
    }
    this._chart.yAxis.tickValues(tickValues).showMaxMin(true).tickFormat(functionTickFormat);
    this._chart.xAxis.tickPadding(5).showMaxMin(false).tickFormat(this.model.get('xAxisFunction'));

    this._chart.xAxis.axisLabel(this.model.get('xAxisLabel'));
    var marginTop = 10;
    var marginLeft = 30;
    var marginLeftWithYAxis = 50;
    if(this.model.get('yAxisLabel')){
      this._chart.yAxis.axisLabel(this.model.get('yAxisLabel'));
      this._chart.yAxis.axisLabelDistance(-10);
      this._chart.margin({'top':marginTop, 'left':marginLeftWithYAxis});
    }else{
      this._chart.margin({'top':marginTop, 'left':marginLeft});
    }

    var svg = d3.select(this.$('.chart')[0]);



    d3.select(this.$('.chart')[0])
        .datum(data)
        .call(this._chart);

    this.$('.nvd3.nv-legend').hide();

    svg.insert('rect', '.nv-wrap')
    .attr("x", marginLeftWithYAxis) // start rectangle on the good position
    .attr("y", 45) // no vertical translate
    .attr("width", svg.node().getBBox().width - 2 - marginLeftWithYAxis) // correct size
    .attr("height", svg.node().getBBox().height  - 25) // full height
    .attr("fill", "rgba(66,139,202, 0.2)");

    //Linea divisoria para warning y error
    if(this.model.get("divisorLines") != undefined) {
      var _this = this;
      _.each(this.model.get("divisorLines"), function(o) {
        svg.append('line')
        .attr({
            x1: marginLeftWithYAxis,
            y1: _this._chart.yAxis.scale()(o.value) + 45,
            x2: svg.node().getBBox().width - 3,
            y2: _this._chart.yAxis.scale()(o.value) + 45
        })
        .style("stroke", o.color)
        .style('stroke-dasharray', ('3, 3'));
      });
    }

    if(this.model.get("realTimeComponent") != undefined) {
      var model = new Backbone.Model({
        botonLocationView:this.$(".botons"),
        tooltipIcon: __('Ahora')
      });
      this._renderRealTimeComponent(model);
    }

    return this;
  },
});

App.View.Widgets.SingleStackedBarDoubleYAxis = App.View.Widgets.StackedSingleBar.extend({
  initialize: function(options) {

    _.bindAll(this, "_onMaxValueFetched", "_onModelFetched", "_onCollectionReset");

    this.options = options;
    this.model = options.model;
    this.modelMaxValue = options.dataMaxValue;
    this.modelMaxValue.fetch({success:this._onMaxValueFetched});

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      this.render();
      this.$('.widget').addClass('active');
      this.modelMaxValue.fetch({success:this._onMaxValueFetched});
      this.$('.loading.widgetL').removeClass('hiden');
    });

    if(this.model.get('popupTemplate')){
      this._template_popup = _.template($(this.model.get('popupTemplate')).html());
    }
    this.render();
  },

  _onMaxValueFetched: function() {
    this.model.set("maxValue", this.modelMaxValue?this.modelMaxValue.get('capacity'):undefined);
    if(this.options.data instanceof Backbone.Model) {
      this.modelData = this.options.data;
      this.modelData.fetch({success:this._onModelFetched, data:this.modelData.options.data || {}})
    } else if(this.options.data instanceof Backbone.Collection) {
      this.collection = this.options.data;
      this.listenTo(this.collection, "reset", this._onCollectionReset);
      this.collection.fetch({'reset':true});
    }
  },

});
