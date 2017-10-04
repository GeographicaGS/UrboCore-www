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

App.View.Widgets.MultiDeviceChart = App.View.Widgets.MultiVariableChart.extend({
  _list_variable_template: _.template( $('#widgets-widget_multiDevice_list_variables').html() ),
  _popup_template: _.template( $('#widgets-widget_multiDevice_chart_popup').html() ),
  /*
    TODO: Create documentation
    This widget inherits from MultiVariableChart and overrides the drawChart function
  */
  initialize:function(options) {
    App.View.Widgets.MultiVariableChart.prototype.initialize.call(this, options);
    this.multiDeviceModel = options.multiVariableModel;
  },

  events: function() {
    return _.extend({}, App.View.Widgets.MultiVariableChart.prototype.events, {
      "click .changeVariable" : "_changeVar",
    });
  },

  _changeVar: function(e) {
    var variableId = $(e.currentTarget).attr("data-var");
    var variableAgg = $(e.currentTarget).attr("data-agg");
    this.currentVariable = _.find(this.multiDeviceModel.get("variables"), function(v) {
      return v.id==variableId+variableAgg;
    });
    this.collection.options.variable = this.currentVariable.variable.id;
    this.collection.options.agg = this.currentVariable.agg;
    this.collection.fetch({reset:true});
    this.render();
  },

  _drawChart:function(){
    App.Utils.initStepData(this);

    var varId = this.collection.options.variable+this.collection.options.agg;
    this.currentVariable = _.find(this.multiDeviceModel.get("variables"), function(v) {
      return v.id == varId;
    });

    this.$('.loading.widgetL').addClass('hiden');

    var _this = this;
    var oneVarInMultiVar = false;

    this.data = new Backbone.Collection (
      _.each(this.collection.toJSON(), function(c, index) {
        if(_this.data){
          var data = _this.data.findWhere({'key':c.key});
          if(data != undefined) {
            c.key = data.get('key');
          }
        }else{
          c.key = c.key;
        }

        var max = _.max(c.values, function(v){ return v.y; }).y;
        var min = _.min(c.values, function(v){ return v.y; }).y;
        c.values = _.map(c.values, function(v){
          var valueReturn = {
            'x':v.x,
            'y':v.y,
            'realY':v.y
          };
          if(v.key != 'avg')
            valueReturn['y'] = (max-min) > 0 ? (v.y-min)/(max-min) : 0;

          return valueReturn;
        });
      })
    );
    // if(this.data.where({'disabled': false}).length > 1){
      // d3.select(this.$('.chart')[0]).classed('normalized',true);
    // }else{
    //   oneVarInMultiVar = true;
      d3.select(this.$('.chart')[0]).classed('normalized',false);
    // }

    var colour = [App.mv().getAdditionalInfo(this.currentVariable.variable.id).colour];

    this.chart = nv.models.lineChart()
                          .useInteractiveGuideline(true)
                          .margin({'right':30})
                          .height(268)
                          .noData(__('No hay datos disponibles'))
                          .color(colour)
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

    this.chart.interactiveLayer.tooltip.contentGenerator(function(data) {
      return _this._popup_template({'series':data.series});
    });

    this.chart.update();

    nv.utils.windowResize(this.chart.update);
    var existValues = _.find(this.collection.toJSON(), function(v){return v.values.length > 0});
    if(existValues != undefined) {
      this.$('.var_list').html(this._list_variable_template({
        'variables':this.multiDeviceModel.get("variables"),
        color:colour[0],
        variableSelected:this.currentVariable
      }));
    } else {
      this.$('.var_list').html('');
    }
    $(".nv-legendWrap.nvd3-svg").hide();

    //Estilos de lineas
    var indexLine = _.findIndex(this.data.toJSON(), function(v) { return v.key == 'avg' });
    this.$('.nv-groups g').css("stroke-opacity", "0.3");
    this.$('.nv-group.nv-series-' + indexLine).css("stroke-width", "2px");
    this.$('.nv-group.nv-series-' + indexLine).css("stroke-opacity", "1");

    return this;
  },

  _getUniqueDataEnableToDraw:function(){
    var _this = this;
    return _.map(this.collection.toJSON(), function(j){ j.key = _this.data.findWhere({'key':j.key}).get('key') ; return j });
  },
  _updateYAxis:function(){
    if(this.data.toJSON().length > 0) {
      var values = this.data.toJSON()[0].values;
      var format = App.d3Format.numberFormat('s');
      for(var i=0; i<values.length; i++){
        if(values[i].realY < 1){
          format = App.d3Format.numberFormat(',.3r');
          break;
        }
      }
      this.chart.yAxis.axisLabel("Unidad variable");
      this.chart.yAxis.showMaxMin(false).tickFormat(format);
      this.svgChart.selectAll('.nv-focus .nv-y').call(this.chart.yAxis);
    }
  },
});
