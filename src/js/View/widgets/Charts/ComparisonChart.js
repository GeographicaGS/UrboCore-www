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
 *  - dataComparative (Backbone Collection). Chart data to compare.
 *  - opts:
 *    - showLineDots (Boolean, default: false). Show dots on lines without hover
 *    - nofilter (Boolean, default: false). Hides date selector for comparison timeserie
 */
App.View.Widgets.Charts.Comparison = App.View.Widgets.Charts.Base.extend({
  initialize: function(options){
    if(!options.opts.has('showLineDots')) options.opts.set({showLineDots: false});
    if(!options.opts.has('nofilter')) options.opts.set({nofilter: false});

    this.collectionComp = options.dataComparative;
    this.listenTo(this.collectionComp,"reset",this._drawChart);

    App.View.Widgets.Charts.Base.prototype.initialize.call(this,options);

    this._dateModel = new App.Model.Context({
      local: true,
      start: options.compStart || moment(App.ctx.getDateRange().start).subtract(7, 'days'),
      finish: options.compFinish || moment(App.ctx.getDateRange().finish).subtract(7, 'days')
    });
    this._dateControl = new App.View.Date({model: this._dateModel});
    this.listenTo(this._dateModel, 'change:start change:finish', this._changeDate);
  },

  render: function(){
    App.View.Widgets.Charts.Base.prototype.render.call(this);
    if(this.options.get('showLineDots')){
      this.$el.addClass('showLineDots');
    }
    if(!this.options.get('nofilter')) this.$el.prepend(this._dateControl.render().$el);
    return this;
  },

  _initAggs: function(){
    // Aggregation
    this._aggregationInfo = [{},{}];
    var _this = this;
    if(this.options.get('showAggSelector')
      && this.collection.options
      && this.collection.options.data
      && this.collection.options.data.agg
      && this.collection.options.data.agg.length > 0
      && this.collectionComp.options
      && this.collectionComp.options.data
      && this.collectionComp.options.data.agg
      && this.collectionComp.options.data.agg.length > 0){

      _.each(this.collection.options.data.vars, function(var_id, idx){
        var varMetadata = App.mv().getVariable(var_id);
        if(varMetadata && varMetadata.get('var_agg') && varMetadata.get('var_agg').length > 0){
          var key = var_id + '_' + 0;
          _this._aggregationInfo[0][key] = {
            available: varMetadata.get('var_agg'),
            current: _this.collection.options.data.agg[idx]
          };
        }
      });

      _.each(this.collectionComp.options.data.vars, function(var_id, idx){
        var varMetadata = App.mv().getVariable(var_id);
        if(varMetadata && varMetadata.get('var_agg') && varMetadata.get('var_agg').length > 0){
          var key = var_id + '_' + 1;
          _this._aggregationInfo[1][key] = {
            available: varMetadata.get('var_agg'),
            current: _this.collectionComp.options.data.agg[idx]
          };
        }
      });
    }else{
      this._aggregationInfo = false; // Ensure checks
    }
  },

  _processData: function(){
    this._colors = this.options.get('colors');
    this.data = [];

    var disabledCol = false;
    var disabledColComp = false;
    var _this = this;
    var disabledList = this._internalData.disabledList;
    if(Object.keys(disabledList).length!==0){
      _.each(disabledList, function(value, key){

        var total = key.split('_').length;
        var var_name = key.split('_')[0];
        var var_idx = parseInt(key.split('_')[total-1]);

        if(value){

          if(var_idx===1){
            disabledColComp = true;
          }
          else if(var_idx===0){
            disabledCol = true;
          }
        }
        else {
          disabledCol = false;
          disabledColComp = false;
        }
      });

    }


    if(this.collection.toJSON().length) {
      this.data.push(this._extractData(this.collection, disabledCol));

      // If we have no dates we have no compared data to show
      if(this._dateModel.getDateRange() && this.collectionComp.toJSON().length)
        this.data.push(this._extractData(this.collectionComp, disabledColComp));
    }
    
    // Check number of values
    if(this.data[0] && this.data[1] && this.data[0].values && this.data[1].values){
      var longer, shorter, difference = this.data[0].values.length - this.data[1].values.length;
      if(difference < 0){
        longer = this.data[1];
        shorter = this.data[0];
      }else if(difference > 0){
        longer = this.data[0];
        shorter = this.data[1];
      }
      if(difference !== 0){
        var lowerLength = shorter.values.length;
        for(var i = 0; i < Math.abs(difference); i++){
          shorter.values.push({x: longer.values[lowerLength + i].x, y:null});
        }
      }
    }
  },

  _extractData: function(collection, disabled){
    var data = collection.toJSON();
    var _this = this;

    _.each(data, function(elem){
      elem.realKey = elem.key;
      if(_this.options.get('legendNameFunc') && _this.options.get('legendNameFunc')(elem.key))
        elem.key = __(_this.options.get('legendNameFunc')(elem.key));

      // Fix the changes in models and collections (BaseModel & BaseCollections)
      if (collection && collection.options && typeof collection.options.data === 'string') {
        collection.options.data = JSON.parse(collection.options.data);
      }

      // Add date to key
      elem.key += ' ' + App.formatDate(collection.options.data.time.start) + ' - ' + App.formatDate(collection.options.data.time.finish);

      if(!disabled){
        // Normalize X Axis
        var step = _this.options.get('currentStep');
        var match, multiplier = 1;
        if((match = step.match(/(\d)d/)) !== null){
          multiplier = match[1] * 24;
        }else if((match = step.match(/(\d)h/)) !== null){
          multiplier = match[1];
        }
        _.each(elem.values, function(value, idx){
          if(value.realX === undefined) value.realX = value.x;
          value.x = idx * multiplier;
        });
      }
      else {
        elem.values = [];
      }

    });

    return data[0];
  },

  _fetchData: function(){
    // Step
    if(this.options.get('currentStep')){
      if(this.collection.setStep)
        this.collection.setStep(this.options.get('currentStep'));
      if(this.collectionComp.setStep)
        this.collectionComp.setStep(this.options.get('currentStep'));
    }

    // Date
    if(this.collection.setTimeRange){
      var date = App.ctx.getDateRange();
      this.collection.setTimeRange(date.start,date.finish);
    }

    var date = this._dateModel.getDateRange();
    if(date && this.collectionComp.setTimeRange){
      this.collectionComp.setTimeRange(date.start,date.finish);
    }

    // Aggregation
    if(this._aggregationInfo){
      var _this = this;
      var aggs = [];
      _.each(this.collection.options.data.vars, function(var_id){
        aggs.push(_this._aggregationInfo[0][var_id+'_'+0].current);
      });
      this.collection.options.data.agg = aggs;

      aggs = [];
      _.each(this.collectionComp.options.data.vars, function(var_id){
        aggs.push(_this._aggregationInfo[1][var_id+'_'+1].current);
      });
      this.collectionComp.options.data.agg = aggs;
    }

    this.collection.fetch({'reset': true, data:this.collection.options.data || {}});
    if(date){
      this.collectionComp.fetch({'reset': true, data:this.collectionComp.options.data || {}});
    }
  },

  _initChartModel: function(){
    this._chart = nv.models.lineChart()
        .showLegend(!this.options.get('hideLegend'))
        .color(this._colors)
        .margin({'bottom':15})
        .height(270)
        .useInteractiveGuideline(true)
        .noData(this.options.get('noDataMessage'))
    ;
    this._chart.yAxis.tickPadding(10);
  },

  _initTooltips: function(){
    if(!this.options.get('hideTooltip')){
      var _this = this;
      if(!this.options.get('tooltipFunc')){
        this._chart.interactiveLayer.tooltip.contentGenerator(function(obj){
          var templateData = {
            data: obj,
            utils: {}
          };
          if(_this.options.get('xAxisFunction')){
            templateData.utils.xAxisFunction = _this.options.get('xAxisFunction');
          }
          if(_this.options.get('yAxisFunction')){
            templateData.utils.yAxisFunction = _this.options.get('yAxisFunction');
          }
          return _this._template_tooltip(templateData);
        });
      }else{
        this._chart.interactiveLayer.tooltip.contentGenerator(this.options.get('tooltipFunc'));
      }
    }else{
      this._chart.tooltip.classes(['hide']);
    }
  },

  _formatXAxis: function(){
    this._chart.xAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('xAxisShowMaxMin') ? this.options.get('xAxisShowMaxMin'): true)
      .tickFormat(this.options.get('xAxisFunction'))
    ;
    if(this.data.length > 1 && this.data[0].values && this.data[0].values.length && this.data[1].values && this.data[1].values.length){
      var start = Math.min(this.data[0].values[0].x,this.data[1].values[0].x);
      var finish = Math.min(this.data[0].values[this.data[0].values.length - 1].x,this.data[1].values[this.data[1].values.length - 1].x);
      var diff = 12;
      if((finish - start) > 480){
        diff = 48;
      }else if((finish - start) > 72){
        diff = 24;
      }
      this._chart.xAxis
        .domain([start,finish])
        .tickValues(_.range(start, finish, diff))
      ;
    }
  },

  _formatYAxis: function(){
    // Get max value
    var maxVals =  _.map(_.flatten(_.map(this.data, function(data){
      return _.map(data.values, function(el){ return el.y }) })), function(d){ return parseFloat(d) });
    var max = parseFloat(_.max(maxVals));
    var min = parseFloat(_.min(maxVals));

    var yDomain = this.options.get('yAxisDomain') || [min, max] || [0, 5];
    var diff = Math.ceil((yDomain[1] - yDomain[0]) / 5);

    // Extra
    yDomain[0] -= (diff/2);
    if(min > 0) {
      yDomain[0] = yDomain[0] > 0 ? yDomain[0] : 0;
    }
    yDomain[1] += (diff/2);

    var yInterval = [];
    var nextVal = yDomain[0];
    do {
      yInterval.push(nextVal);
      nextVal += diff;
    }while(yDomain[1] > nextVal);


    this._chart.forceY(yDomain);
    this._chart.yAxis
      .tickPadding(5)
      .showMaxMin(this.options.has('yAxisShowMaxMin') ? this.options.get('yAxisShowMaxMin'): true)
      .tickFormat(this.options.get('yAxisFunction'))
      .domain(yDomain)
      .tickValues(yInterval)
    ;
  },

  _changeDate: function(){
    this._clearData();
    this._fetchData();
  },

  _changeStep: function(e){
    this._clearData();
    App.View.Widgets.Charts.Base.prototype._changeStep.call(this,e);
  },

  _clickLegend: function(element) {

    // App.View.Widgets.Charts.Base.prototype.render.call(this);
    // this._fetchData();


    var tags = $(".btnLegend").size();
    var realKey = $(element.target).closest("div").attr("id");
    var varMetadata = App.mv().getVariable(realKey);
    var orderKey = $(element.target).closest("div").attr("tag"); // Prevent dups
    realKey = realKey + '_' + orderKey;

    var disabledList = this._internalData.disabledList;

    var disabled = ((disabledList[realKey] === undefined || disabledList[realKey] === false) && this._internalData.elementsDisabled != tags - 1);
    var enabled = (disabledList[realKey] === true);

    if( disabled || enabled ) {

      ($(this.$(".chart .nv-series").get($(element.target).parent().attr("tag")))).d3Click();
      $(element.target).parent().toggleClass("inactive");

      if(this.options.get('showAggSelector')){
        var ch = $(this.$('.agg')[orderKey]);
        ch.toggleClass('hidden');
      }

      disabledList[realKey] = !disabledList[realKey];
      this._internalData.elementsDisabled = disabledList[realKey] ? this._internalData.elementsDisabled + 1 : this._internalData.elementsDisabled - 1;

      if( enabled ) {
        this._fetchData();
      }
    }

  },


  _changeAgg: function(e){
    e.preventDefault();

    this._clearData();
    var $target = $(e.currentTarget);
    var agg = $target.data('agg');
    var var_id = $target.parent().data('id');
    var col_idx = $target.parents('.btnLegend').attr('tag');
    var key = var_id+'_'+col_idx;
    this._aggregationInfo[col_idx][key].current = agg;
    this._fetchData();
  },

  _clearData: function(){
    _.invoke(this.collection.toArray(), 'destroy');
    _.invoke(this.collectionComp.toArray(), 'destroy');
  }
});
