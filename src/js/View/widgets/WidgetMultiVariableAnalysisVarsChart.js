'use strict';

App.View.Widgets.MultiVariableAnalysisVarsChart = App.View.Widgets.MultiVariableChart.extend({
  _list_variable_template: _.template( $('#widgets-widget_multiVariable_list_variables').html() ),
  /*
    TODO: Create documentation
    This widget inherits from MultiVariableChart and overrides the drawChart function.
    It allows to compare the same variables with different AGGREGATION
  */
  initialize:function(options) {
    App.View.Widgets.MultiVariableChart.prototype.initialize.call(this, options);
    this.multiVariableModel = options.multiVariableModel;
  },
  _drawChart:function(){
    App.Utils.initStepData(this);
    this.$('.loading.widgetL').addClass('hiden');

    var _this = this;
    var oneVarInMultiVar = false;

    this.data = new Backbone.Collection (
      _.each(this.collection.toJSON(), function(c, index) {

        if(_this.data){

          var data = _this.data.findWhere({'realKey':c.key});
          if(data != undefined) {
            c.realKey = data.get('realKey');
            c.key = data.get('key');
            c.currentAgg = data.get('currentAgg');
            c.disabled = _this._internalData.disabledList[c.realKey];
            _this.collection.findWhere({'key':c.realKey}).set('disabled',c.disabled);
          }

        }else{
          //Inicializacion de la estructura interna de datos
          //Siempre va a llegar un AGGDEFAULTVALUE
          var internalData = _this._internalData;
          var variable = App.mv().getVariable(c.key);
          var currentDefaultAgg = !_.isEmpty(_this._aggDefaultValues) ? _this._aggDefaultValues[index]:null;
          c.realVariableKey = c.key;
          c.realKey = c.key;
          c.key = variable.get('name') + " - " + App.getAggStr(currentDefaultAgg).toUpperCase();
          internalData.disabledList[c.realKey] = false;
        }

        // Normalization using domain if available
        var min, max;
        if(_this.multiVariableModel.has('yAxisDomain') && _this.multiVariableModel.get('yAxisDomain')[c.realKey] !== undefined){
          min = _this.multiVariableModel.get('yAxisDomain')[c.realKey][0];
          max = _this.multiVariableModel.get('yAxisDomain')[c.realKey][1];
        }else{
          min = _.min(c.values, function(v){ return v.y; }).y;
          max = _.max(c.values, function(v){ return v.y; }).y;
        }
        c.values = _.map(c.values, function(v){
          return {'x':v.x,'y':(max-min) > 0 ? (v.y-min)/(max-min) : 0, 'realY':v.y}
        });
      })
    );
    if(this.data.where({'disabled': false}).length > 1){
      d3.select(this.$('.chart')[0]).classed('normalized',true);
    }else{
      oneVarInMultiVar = true;
      d3.select(this.$('.chart')[0]).classed('normalized',false);
    }

    var colours = _.map(this.multiVariableModel.get("colours"), function(colour) {
      return colour.colour;
    });

    this.chart = nv.models.lineChart()
                          .useInteractiveGuideline(true)
                          .margin({'right':30})
                          .height(268)
                          .noData(__('No hay datos disponibles'))
                          .color(colours)
    ;

    this.chart.legend.margin({bottom: 40});

    //oneVarInMultiVar vale true en el caso especial de que estemos pintando varias variable pero solo hay aciva una
    if(!oneVarInMultiVar){

      this.svgChart = d3.select(this.$('.chart')[0])
       .datum(this.data.toJSON())
      .call(this.chart)
      ;

    }else{
      this.svgChart = d3.select(this.$('.chart')[0])
       .datum(this._getUniqueDataEnableToDraw())
      .call(this.chart)
      ;
    }

    this.chart.xAxis.showMaxMin(true).tickFormat(function(d) {
      var localdate = moment.utc(d).local().toDate();

      if(moment(App.ctx.get('finish')).diff(moment(App.ctx.get('start')),'days') == 0){
        return d3.time.format('%H:%M')(localdate);
      }
      return d3.time.format('%d/%m/%Y')(localdate);
    });

    // this.chart.xAxis.axisLabel('Fecha');
    this._updateYAxis();

    // Force Y axis domain because of normalization
    this.chart.forceY([0,1]);

    this.chart.interactiveLayer.tooltip.contentGenerator(function(data) {
      _.each(data.series,function(s) {
        var model = _this.data.findWhere({'key': s.key})
        s['realKey'] = model.get('realKey');
        s.value = _.find(model.get('values'), function(v){
                    return v.x.toString() == data.value.toString();
                  }).realY;
      });
      return _this._popup_template({'series':data.series});
    });

    this.chart.update();

    nv.utils.windowResize(this.chart.update);
    var existValues = _.find(this.collection.toJSON(), function(v){return v.values.length > 0});
    if(existValues != undefined) {
      this.$('.var_list').html(this._list_variable_template({
        colors:colours,
        data : this.data.toJSON(),
        'currentAggs':undefined,
        'disabledList':this._internalData.disabledList
      }));
    } else {
      this.$('.var_list').html('');
    }
    $(".nv-legendWrap.nvd3-svg").hide();
    return this;
  },
  _getUniqueDataEnableToDraw:function(){
    var _this = this;
    return _.map(this.collection.toJSON(), function(j){ j.key = _this.data.findWhere({'realKey':j.key}).get('key') ; return j });
  },
  _updateYAxis:function(){
    var col = this.data.where({'disabled': false});
    if(col.length == 1){
      var values = col[0].get('values');
      var format = App.d3Format.numberFormat('s');
      for(var i=0; i<values.length; i++){
        if(values[i].realY < 1){
          format = App.d3Format.numberFormat(',.3r');
          break;
        }
      }

      var metadata = App.mv().getVariable(col[0].get('realKey'))
      this.chart.yAxis.axisLabel(metadata.name + ' (' + metadata.units + ')');
      this.chart.yAxis.showMaxMin(true).tickFormat(format);
      this.svgChart.selectAll('.nv-focus .nv-y').call(this.chart.yAxis);

    }
  },
});
