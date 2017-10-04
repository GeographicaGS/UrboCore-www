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

App.View.Widgets.MultiVariableHorizontalChart = Backbone.View.extend({
  _template: _.template( $('#widgets-widget_multiVariable_horizontalChart').html() ),

  initialize: function(options) {

    this.model = options.model;
    this.collection = options.collection
    this.listenTo(this.collection,"reset",this._drawChart);
    this.collection.fetch({'reset':true})

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      this.collection.fetch({'reset':true});
      this.render();
    });

    this.listenTo(this.model,"change:order",function(){
      this.collection.fetch({'reset':true});
      this.render();
    });


    this.render();
  },


  onClose: function(){
    this.stopListening();
  },

  events: {
    'click .popup_widget li': '_changeOrder',
  },

  render: function(){
  	this.$el.html(this._template({'m':this.model.toJSON()}));
    this.$('.widget').append(App.widgetLoading());
    return this;
  },

  _drawChart:function(){
    this.$('.loading.widgetL').addClass('hiden');
  	var _this = this;
  	var maxElements = 0;

  	if(this.model.get('barColors')){
  		var colors = this.model.get('barColors');
  		this.collection.each(function(model,i) {
  			i < colors.length ?  model.set('color',colors[i]) : null;
  			maxElements = model.get('values').length > maxElements ? model.get('values').length : maxElements;
  		});
  	}

  	if(maxElements > 6 && this.model.get('scollEnabled')){
  		this.$('.wrapper_chart').addClass('mainScroll')
  		this.$('.chart').height(maxElements * 55);
  	}else{
      this.$('.wrapper_chart').removeClass('mainScroll')
      this.$('.chart').css({'height':''})
    }

  	this.chart = nv.models.multiBarHorizontalChart()
					         .x(function(d) { return d.label })
					         .y(function(d) { return d.value })
					         .stacked(this.model.get('staked'))
					         .showControls(false)
					         .valueFormat(function(d){
					         	return App.nbf(d) + (_this.model.get('unit') ? _this.model.get('unit'):'');
					         })
					         .showValues(this.model.get('showValues'))
					         .groupSpacing(0.5)
                   .noData(__("No hay datos disponibles"))
    ;

    if(this.model.get('left'))
    	this.chart.margin({'left':this.model.get('left')});

    this.chart.yAxis.showMaxMin(false).tickFormat(App.d3Format.numberFormat('s')).orient(this.model.get('yAxisOrient'));
    this.chart.legend.margin({bottom: 20})

    this.chart.tooltip.valueFormatter(function(d){
    	return App.nbf(d) + (_this.model.get('unit') ? _this.model.get('unit'):'');
    });

    this.chart.tooltip.classes('default')

  	d3.select(this.$('.chart')[0])
		 	.datum(this.collection.toJSON())
    	.call(this.chart)
    ;

    if(this.model.get('yAxisOrient') == 'top'){
    	d3.select('.chart').classed('orientTop',true);
    }

    setTimeout(function(){
    	_this.chart.legend.margin({bottom: 40, right:this.$('.chart').width()/2 - d3.select(this.$('.nv-legendWrap')[0]).node().getBoundingClientRect().width/2 - 40});
    	_this.chart.update();
  	},100);
    _.each(this.$('.nv-series'), function(g) {
      var color = d3.select($(g).find('circle')[0]).node().style.fill;
      d3.select($(g).find('text')[0]).style('fill',color);
    });



    nv.utils.windowResize(this.chart.update);

  },

  _changeOrder:function(e){
  	e.preventDefault();
    var order = $(e.currentTarget).attr('data-order');
    this.collection.options.order = order;
    this.model.set('order',order)
  }

});
