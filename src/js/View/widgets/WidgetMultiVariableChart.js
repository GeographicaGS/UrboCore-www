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

App.View.Widgets.MultiVariableChart = Backbone.View.extend({
  _template: _.template( $('#widgets-widget_multiVariable_chart').html() ),
  // _popup_template: _.template( $('#widgets-widget_multiVariable_chart_popup').html() ),
  _popup_template: _.template( $('#chart-base_charttooltip').html() ),
  _list_variable_template: _.template( $('#widgets-widget_multiVariable_list_variables').html() ),

  /*
    TODO: Create documentation
    Params:
      el: DOM element (Optional)
      collection: Backbone Collection (Mandatory) Collection containing the chart data
      stepModel: Backbone Model (Optional) Model containing the current step
      multiVariableModel: Backbone Model (Optional) Model containing a set of config parameters such as 'category' (string), 'title' (string) or 'aggDefaultValues' (JS Object)
      noAgg: true|false (Optional, default: false) Disables aggregation controls
  */
  initialize: function(options) {

    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this._multiVariableModel = options.multiVariableModel;
    this.options = {
      noAgg: options.noAgg || false
    };
    this._aggDefaultValues = this._multiVariableModel ? this._multiVariableModel.get("aggDefaultValues"):[];


    if(this._stepModel){
      this.collection.options.step = this._stepModel.get('step');
      this.listenTo(this._stepModel,"change:step",function(){
        this.collection.fetch({'reset':true});
        this.render();
      });
    }

    this.collection.options.agg = this._aggDefaultValues ? this._aggDefaultValues:this.collection.options.agg;

    this._internalData = {
      disabledList : {},
      elementsDisabled : 0,
      currentAggs : {}
    };

    this.listenTo(this.collection,"reset",this._drawChart);
    this.collection.fetch({'reset':true, data: this.collection.options.data || {} })

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      if (!this.collection.options.data) {
        this.collection.options.data = {time:{}}
      }
      this.collection.options.data.time.start = this._ctx.get('start').format();
      this.collection.options.data.time.finish = this._ctx.get('finish').format();

      App.Utils.checkBeforeFetching(this);
      this.collection.fetch({'reset':true, data: this.collection.options.data || {} })
      this.render();
    });

    this.render();
  },

  onClose: function(){
    this.stopListening();
  },

  events: {
    'click .nv-series': '_redrawSeries',
    'click .popup_widget.agg li': '_changeAgg',
    'click .popup_widget.step li': '_changeStep',
    'click .btnLegend .text.first': '_clickNewLegend',
    'click .popup_widget.agg' : function(e) {
      e.stopPropagation();
    }
  },

  _clickNewLegend: function(element) {
    var tags = this.$(".btnLegend").size();
    var realKey = $(element.target).closest("div").attr("id");

    var disabledList = this._internalData.disabledList;
    if(((disabledList[realKey] == undefined || disabledList[realKey] === false) &&
    this._internalData.elementsDisabled != tags - 1) || disabledList[realKey] === true) {
      $($($(".chart .nv-series")).get($(element.target).parent().attr("tag"))).click();
      $(element.target).parent().toggleClass("inactive");

      disabledList[realKey] = !disabledList[realKey];
      var $aggMenu = $(element.target).closest("div").find("a");
      if($aggMenu.css('visibility') == 'hidden') {
        $aggMenu.css('visibility', 'visible');
      } else {
        $aggMenu.css('visibility', 'hidden');
      }
      this._internalData.elementsDisabled = disabledList[realKey] ? this._internalData.elementsDisabled + 1 : this._internalData.elementsDisabled - 1;

      var variable = $(element.target).text();

      var model = this.data.findWhere({key: variable});
      if(model != undefined) {
        model.set('disabled', !model.get('disabled'));
      }
      var model = this.collection.findWhere({key: realKey});
      if(model != undefined) {
        model.set('disabled', !model.get('disabled'));
      }
      if(this.data.where({'disabled': false}).length == 1){
        var json = this._getUniqueDataEnableToDraw();
        this.svgChart.datum(json).call(this.chart);
        this.svgChart.classed('normalized',false);
        this._updateYAxis();
      }else{
        this.svgChart.datum(this.data.toJSON()).call(this.chart)
        this.svgChart.classed('normalized',true)
      }
    }
  },

  render: function(){
  	this.$el.html(this._template({
      's':this._stepModel ? this._stepModel.toJSON():null,
      'm':this._multiVariableModel ? this._multiVariableModel.toJSON():null,
      'stepsAvailable':this._stepsAvailable
    }));
    this.$('.widget').append(App.widgetLoading());
    return this;
  },

  _drawChart:function(){
    App.Utils.initStepData(this);
    this.$('.loading.widgetL').addClass('hiden');

    var _this = this;
    var oneVarInMultiVar = false;

    //Por si el servidor devuelve series con valores a nulos
    _.each(this.collection.where(function(c){return c.get('values').length == 0;}),function(m){
      _this.collection.remove(m);
    })

      this.data = new Backbone.Collection (
        _.each(this.collection.toJSON(), function(c, index) {

          if(_this.data && _this.data.length){
            var data = _this.data.findWhere({'realKey':c.key});
            if(data != undefined) {
              c.realKey = data.get('realKey');
              c.key = data.get('key');
              c.aggs = data.get('aggs');
              c.currentAgg = data.get('currentAgg');
              c.disabled = _this._internalData.disabledList[c.realKey];
              _this.collection.findWhere({'key':c.realKey}).set('disabled',c.disabled);
            }

          }else{
            c.realKey = c.key;
            c.key = App.mv().getVariable(c.key).get('name');
            c.aggs = App.mv().getVariable(c.realKey).get('var_agg');

            //Inicializacion de la estructura interna de datos
            var internalData = _this._internalData;
            var meta = App.mv().getVariable(c.realKey);
            if(meta && meta.get('config') && meta.get('config').hasOwnProperty('default'))
              internalData.disabledList[c.realKey] = !meta.get('config').default
            else
              internalData.disabledList[c.realKey] = false;

            if(!_this.options.noAgg){
              var currentDefaultAgg = !_.isEmpty(_this._aggDefaultValues) ? _this._aggDefaultValues[c.realKey]:null;
              if((c.aggs != undefined && c.aggs[0] != "NOAGG") && (_.isEmpty(_this._aggDefaultValues) || (currentDefaultAgg != "NONE"))) {
                if(currentDefaultAgg == undefined || !_.contains(c.aggs,currentDefaultAgg.toUpperCase())) {
                  c.currentAgg = c.aggs ? c.aggs[0]:null;
                  _this.collection.options.agg[c.realKey] = c.currentAgg;
                  internalData.currentAggs[c.realKey] = c.currentAgg;
                } else {
                  c.currentAgg = currentDefaultAgg;
                  _this.collection.options.agg[c.realKey] = currentDefaultAgg;
                  internalData.currentAggs[c.realKey] = currentDefaultAgg;
                }
              }
            }
          }
          // var max = _.max(c.values, function(v){ return v.y; }).y;
          // var min = _.min(c.values, function(v){ return v.y; }).y;
          // c.values = _.map(c.values, function(v){
          //   return {'x':v.x,'y':(max-min) > 0 ? (v.y-min)/(max-min) : 0, 'realY':v.y}
          // });

          // Normalization using domain if available
          var min, max;
          if(_this._multiVariableModel.has('yAxisDomain') && _this._multiVariableModel.get('yAxisDomain')[c.realKey] !== undefined){
            min = _this._multiVariableModel.get('yAxisDomain')[c.realKey][0];
            max = _this._multiVariableModel.get('yAxisDomain')[c.realKey][1];
          }else{
            min = _.min(c.values, function(v){ return v.y; }).y;
            max = _.max(c.values, function(v){ return v.y; }).y;
          }
          c.values = _.map(c.values, function(v){
            return {'x':v.x,'y':(max-min) > 0 ? (v.y-min)/(max-min) : 0, 'realY':v.y}
          });
        })
      );

      _.each(this._internalData.disabledList, function(value, key) {
        if (value) {
          _this.data.find({'realKey': key}).set('disabled', true);
          _this.collection.find({'key': key}).set('disabled', true);
        }
      });

      if(this.data.where({'disabled': false}).length > 1){
        d3.select(this.$('.chart')[0]).classed('normalized',true);
      }else{
        oneVarInMultiVar = true;
        d3.select(this.$('.chart')[0]).classed('normalized',false);
      }

    this.chart = nv.models.lineChart()
                          .useInteractiveGuideline(true)
                          .margin({'right':45})
                          .height(268)
                          .noData(__('No hay datos disponibles'))
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

      if(moment(App.ctx.get('finish')).diff(moment(App.ctx.get('start')),'days') < 2){
        return d3.time.format('%d/%m/%Y %H:%M')(localdate);
      }
      return d3.time.format('%d/%m/%Y')(localdate);
    });

    // this.chart.xAxis.axisLabel('Fecha');
    this._updateYAxis();

    // Force Y axis domain because of normalization
    // this.chart.forceY([0,1]);

    this.chart.interactiveLayer.tooltip.contentGenerator(function(data) {
      _.each(data.series,function(s) {
        var model = _this.data.findWhere({'key': s.key})
        s['realKey'] = model.get('realKey');
        s.value = _.find(model.get('values'), function(v){
                    return v.x.toString() == data.value.toString();
                  }).realY;
      });
      var utils = {
        xAxisFunction: function(d){ return App.formatDateTime(d); }
      };
      return _this._popup_template({data: data, utils: utils});
    });

    this.chart.update();
    nv.utils.windowResize(this.chart.update);
    this.$('.var_list').html(this._list_variable_template({
      colors:d3.scale.category20().range(),
      data : this.data.toJSON(),
      'currentAggs':this._internalData.currentAggs,
      'disabledList':this._internalData.disabledList
    }));
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
      var format = App.nbf;
      for(var i=0; i<values.length; i++){
        if(values[i].realY < 1){
          format = App.d3Format.numberFormat(',.3r');
          break;
        }
      }

      var metadata = App.Utils.toDeepJSON(App.mv().getVariable(col[0].get('realKey')));
      this.chart.yAxis.axisLabel(metadata.name + ' (' + metadata.units + ')');
      this.chart.yAxis.showMaxMin(false).tickFormat(format);
      this.svgChart.selectAll('.nv-focus .nv-y').call(this.chart.yAxis);

    }
  },

  _changeAgg:function(e){
    e.preventDefault();

    var $ulCurrentElement = $(e.currentTarget).closest('ul');
    var realKey = $ulCurrentElement.attr("data-id");
    var currentAggs = this._internalData.currentAggs;

    var agg = $(e.currentTarget).attr('data-agg');
    this.collection.options.agg[realKey] = agg;

    currentAggs[realKey] = agg;
    this.collection.fetch({'reset':true, data: this.collection.options.data || {} })
    this.render();
  },

  _changeStep:function(e){
    e.preventDefault();
    var step = $(e.currentTarget).attr('data-step');
    this.collection.options.step = step;
    this._stepModel.set('step',step);
    this.collection.fetch({'reset':true, data: this.collection.options.data || {} })
    this.render();
  },

});
