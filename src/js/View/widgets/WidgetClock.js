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

App.View.Widgets.Clock = App.View.Widgets.Base.extend({
  _template_popup: _.template( $('#chart-clockPoupTemplate').html() ),

  initialize: function(options) {
    this.options = _.defaults(options,{
      title: 'Distribución horaria de riego',
      timeMode:'now',
      refreshTime:null
    });
    App.View.Widgets.Base.prototype.initialize.call(this,this.options);

    this.dataModel = options.dataModel;
    this.collection = options.collection;
    this.listenTo(this.collection,"reset",this._drawClock);
    this.collection.fetch({'reset':true})

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox',function(){
      this.collection.fetch({'reset':true});
      this.$('.loading.widgetL').removeClass('hiden');
    });

    this.listenTo(this.dataModel,'change:currentTime',function(){
      this._drawClock();
    });

    if(this.dataModel.get('popupTemplate')){
      this._template_popup = _.template($(this.dataModel.get('popupTemplate')).html());
    }

    this.render();
  },

  events: {
    'click .selector span': '_changeCurrentTime'
  },


  onClose: function(){
  	if(this._miniClockIntervale)
  		clearInterval(this._miniClockIntervale)
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));
    if(this.dataModel.get('double'))
    	this.$('.widget').addClass('double');
    this.$('.widget_content').addClass('clock')

    // Fix old widgets (Andalucia)
    // this.$('.widget_content').append('<div class="popup_wrapper nvtooltip xy-tooltip"></div>')
    if(!this.dataModel.get('disablePopup'))
      this.$('.widget_content').append('<div class="popup_wrapper nvtooltip xy-tooltip"></div>')

    if(!this.dataModel.get('double'))
    	this.$('.widget_content').append('<div class="selector"><span class="' + (this.dataModel.get('currentTime') == 'am' ? 'active':'') +'">AM</span><span class="' + (this.dataModel.get('currentTime') == 'pm' ? 'active':'') +'">PM</span></div>');
    else
      this.$('.widget_content').addClass('double')

    this.$('.widget').append(App.widgetLoading());
    return this;
  },

  _drawClock:function(){

  	this.$('.loading.widgetL').addClass('hiden');

  	this.$('.widget_content svg').remove();

  	if(!this.dataModel.get('double')){
  		this._drawBigClock(this.dataModel.get('currentTime'));
  	}else{
  		this._drawBigClock('am');
  		this._drawBigClock('pm');
  	}

    if(!this.dataModel.get('disablePopup')){
      var _this = this;

  		d3.selectAll(this.$('svg')).selectAll('.arc').on('mousemove',null);
  		d3.select(this.$el[0]).on('mouseleave',null);

  		d3.selectAll(this.$('svg')).selectAll('.arc').on('mousemove', function(e){
  			_this.$('.widget_content .popup_wrapper').html(_this._template_popup({'m':_this.dataModel, 'elements':e.data.elements, 'colors':['#00d4e7']}))
        _this.$('.widget_content .popup_wrapper').css({opacity:1})
  			if(!_this.$('.popup_clock').hasClass('active')){
        	_this.$('.popup_clock').addClass('active');
        	// _this.$('.popup_clock').css({'transform':'translate(' + d3.event.clientX + 'px,' + d3.event.clientY + 'px)'})
          _this.$('.popup_wrapper').css({'transform':'translate(' + d3.event.layerX + 'px,' + d3.event.layerY + 'px)'})
  			}
  		});

  		d3.select(this.$('svg')[0]).selectAll('.arc').on('mouseleave', function(e){
  		// d3.select(this.$el[0]).on('mouseleave', function(e){
  			_this.$('.popup_clock').removeClass('active');
        _this.$('.widget_content .popup_wrapper').css({opacity:0})
  		});
    }

  },

  _drawBigClock:function(currentTime){
  	var max = 0;
  	var currentData = [];
  	_.each(this.collection.toJSON(), function(c,i) {
  		if(max < c.elements.length)
  			max = c.elements.length;

  		if((currentTime == 'am' && i <12) || (currentTime == 'pm' && i >=12))
  			currentData.push(c);
  	});


  	var width = 328,
    height = 328,
    offset = 40,
    radius = Math.min(width, height) / 2 - offset,
    numTicks = 4;

		var arc = d3.svg.arc()
	    .outerRadius(function(d) {
	    	var result = radius * (d.data.elements.length/max);
	    	if(result < 20 && result > 0)
	    		return 30;
	    	return result;
	  	})
	    .innerRadius(function(d){
	    	if(d.data.elements.length == 0)
	    		return 0;
	    	return 20;
	    })
	    ;

		var pie = d3.layout.pie()
	    .sort(null)
	    .value(function(d) { return 1; })
	    ;

		var svg = d3.select(this.$('.widget_content')[0]).append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  	.append("g")
		    .attr("transform", "translate(" + width / 2 + "," + (height / 2 -10) + ")");

		var interval = radius/numTicks;
	  var circleAxes = svg.selectAll('.circle-ticks')
	      .data(d3.range(0,radius+interval,interval))
	      .enter().append('svg:g')
	      .attr("class", "circle-ticks");

	  circleAxes.append("svg:circle")
	    .attr("r", String)
	    .attr("class", "circle");

	  var g = svg.selectAll(".arc")
	      .data(pie(currentData))
	    	.enter().append("g")
	      .attr("class", "arc");

	  g.append("path").attr("d", arc);

	  svg.selectAll('.arc').attr( 'transform', 'scale(0,0)').transition().duration( function(d,i){
	  	return 250*i
	  } ).attr( 'transform', 'scale(1,1)')

	  var hourScale = d3.scale.linear().range([0,330]).domain([0,11]);

		var radians = 0.0174532925;

	  svg.selectAll('.hour-label')
			.data(d3.range(1,13))
			.enter()
			.append('text')
			.attr('class', 'hour-label')
			.attr('text-anchor','middle')
			.attr('x',function(d){
				return (radius + 10)*Math.sin(hourScale(d)*radians);
			})
			.attr('y',function(d){
				return -(radius + 10)*Math.cos(hourScale(d)*radians) + 5;
			})
			.text(function(d){
				return d;
			});

		if(this.dataModel.get('double')){
			d3.select($(svg.node()).closest('svg')[0]).append('text')
					.attr('x', 0)
					.attr('y', 20)
					.attr('class','time_info')
					.text(currentTime)
			;
		}

		this._drawMiniClock($(svg.node()).closest('svg')[0]);
  },

  _drawMiniClock:function(svg){

  	var clockRadius = 18;

  	var minuteScale = d3.scale.linear().range([0,354]).domain([0,59]);
  	var secondScale = minuteScale;
		var hourScale = d3.scale.linear().range([0,330]).domain([0,11]);
		var handData = [
			{
				type:'hour',
				value:0,
				length:-2*clockRadius/3,
				scale:hourScale
			},
			{
				type:'minute',
				value:0,
				length:-clockRadius+2,
				scale:minuteScale
			},
			{
				type:'second',
				value:0,
				length:-(clockRadius-12),
				scale:secondScale,
				balance:15
			}
		];

		updateData();

  	// var svg = d3.select(this.$('svg')[0]);
  	svg = d3.select(svg);

	  var face = svg.append('g')
									.attr('id','clock-face')
									.attr('transform','translate(164,154)');

		face.selectAll('.second-tick')
			// .data(d3.range(0,60)).enter()
			.data(d3.range(0,12)).enter()
			.append('line')
			.attr('class', 'second-tick')
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',clockRadius)
			.attr('y2',clockRadius - 4)
			.attr('transform',function(d){
				// return 'rotate(' + secondScale(d) + ')';
				var scale = d3.scale.linear().range([0,330]).domain([0,11]);
				return 'rotate(' + scale(d) + ')';
		});



		face.selectAll('.hour-tick')
			// .data(d3.range(0,12)).enter()
			.data(d3.range(0,4)).enter()
			.append('line')
			.attr('class', 'hour-tick')
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',clockRadius)
			.attr('y2',clockRadius - 7)
			.attr('transform',function(d){
				var scale = d3.scale.linear().range([0,270]).domain([0,3]);
				return 'rotate(' + scale(d) + ')';
		});

		var hands = face.append('g').attr('class','clock-hands');
		hands.selectAll('line')
		.data(handData)
			.enter()
			.append('line')
			.attr('class', function(d){
				return d.type + '-hand';
			})
			.attr('x1',0)
			.attr('y1',function(d){
				return d.balance ? d.balance : 0;
			})
			.attr('x2',0)
			.attr('y2',function(d){
				return d.length;
			})
			.attr('transform',function(d){
				return 'rotate('+ d.scale(d.value) +')';
		});

		function moveHands(face){
			d3.selectAll('.clock-hands').selectAll('line')
			.data(handData)
				.transition()
				.attr('transform',function(d){
					return 'rotate('+ d.scale(d.value) +')';
				});
		}

		function updateData(){
			var t = new Date();
			handData[0].value = (t.getHours() % 12) + t.getMinutes()/60 ;
			handData[1].value = t.getMinutes();
			handData[2].value = t.getSeconds();
		}

		if(this._miniClockIntervale)
  		clearInterval(this._miniClockIntervale)

		this._miniClockIntervale = setInterval(function(){
			updateData();
			moveHands();
		}, 1000);
  },

  _changeCurrentTime:function(e){
  	this.$('.selector span').removeClass('active');
  	$(e.currentTarget).addClass('active');
  	this.dataModel.set('currentTime', $(e.currentTarget).text().toLocaleLowerCase());
  }

});
