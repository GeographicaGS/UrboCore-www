'use strict';

App.View.Widgets.Deprecated.PieChart = App.View.Widgets.Base.extend({
  _template_specific: _.template( $('#widgets-widget_pie_chart_template').html() ),

  initialize: function(options) {

  	this.model = options.model;
    this.collection = options.collection;
    this.pieChartModel = options.pieChartModel;
    this.title = this.pieChartModel.get("title");
    this.img = this.pieChartModel.get("img");
    this.colors = this.pieChartModel.get("colors");
    this.link = this.pieChartModel.get("link");
    this.legend = this.pieChartModel.get("legend");
    this.parseTooltip = this.pieChartModel.get("parseTooltip");
    this.info = this.pieChartModel.get("info");
    this.realTime = this.pieChartModel.get("realTime");
    _.bindAll(this, "_onModelFetch");

    var model = new Backbone.Model({
      onChangeContext:function(){
        if(this.model) {
          this.model.fetch({success:this._onModelFetch});
        } else if(this.collection) {
          this.collection.fetch({reset:true});
        }
        this.render();
      },
      view:this
    });
    this._initContextComponent(model);

    if(this.model) {
      this.model.fetch({success:this._onModelFetch});
    } else if(this.collection) {
      this.listenTo(this.collection, "reset", this._onCollectionReset);
      //this.collection.fetch({reset:true,data: this.collection.options.data || {}});
      this.collection.fetch({reset:true,data: {uno : 3}|| {}});
    }
    this.render();
  },

  onClose: function(){
    this.stopListening();

    if(this._widgetContext != undefined) {
      this._widgetContext.close();
    }
  },

  render: function(){
    this.$el.html(this._template({title : this.title, link : this.link, category:null}));

    this.$(".widget_content").html(this._template_specific({img:this.img}));
    // this.$(".widget_content").closest(".widget").addClass("pieChart");

    this.$('.pieChart_content').append('<svg class="chart"></svg>');

    this.$el.find(".pieChart_content").append(App.widgetLoading());
    this.$(".icon_container").hide();

    this.$(".extra_info").html(this.legend);

    if(this.realTime != undefined) {
      var model = new Backbone.Model({
        botonLocationView:this.$(".botons"),
        tooltipIcon: 'Ahora'
      });
      this._renderRealTimeComponent(model);
    }

    return this;
  },

  _onCollectionReset: function() {
    this._data = this.collection.toJSON();
    this._data = _.map(this._data, function(data) {
      return {label:data.name, value:data.value};
    });
    this._drawChart();
  },

  _drawChart:function(){
    this.$('.loading.widgetL').addClass('hiden');

    var result = _.reduce(this._data, function(m, y) {
    	return m + y.value;
    }, 0);

    if(result != 0) {
      var _this = this;
      var chart = nv.models.pieChart()
          .x(function(d) { return d.label; })
          .y(function(d) { return d.value; })
          .showLabels(false)     //Display pie labels
          .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
          .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
          .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
          .donutRatio(0.62)     //Configure how big you want the donut hole size to be.
          .height(310)
          .color(this.colors)
          .growOnHover(false)
          ;

      d3.select(_this.$('.chart')[0])
        .datum(_this._data)
        .transition().duration(350)
        .call(chart)
      ;

      if(_this.parseTooltip != undefined) {
        chart.tooltip.contentGenerator(function(data) {
          return _this.parseTooltip(data);
        });
      }

      nv.utils.windowResize(chart.update);
      this.$(".nv-legendWrap.nvd3-svg").remove();
      this.$(".icon_container").show();
    } else {
      this.$('.pieChart_content').html("<div class='noData'>No hay datos que mostrar</div>");
    }
  },

  _onModelFetch:function(model, response){
  	this._data = model.toJSON().response;
  	this._drawChart();
    if(this.info != undefined) {
      var model = new Backbone.Model({
        mainView: this.$('.widget'),
        viewToHide:this.$(".widget_content"),
        botonLocationView:this.$(".botons"),
        contentTemplate: this.info.template({})
      });
      this._renderInfoComponent(model);
    }
  },
});
