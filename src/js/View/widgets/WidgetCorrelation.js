'use strict';

App.View.Widgets.Correlation = Backbone.View.extend({

	_template: _.template( $('#widgets-widget_correlation_template').html() ),

  initialize: function(options) {
  	this._model = options.model;
  },

  events: {
    'click .read_more' : '_readMore',
    'mouseleave': '_restoreHeight'
  },

  render:function(){
  	// this.$el.html(this._template({model:this._model.toJSON()}));
  	this.setElement(this._template({model:this._model.toJSON()}));
  	var _this = this;

  	// this.$el.closest('.widget').css({'height':'auto'});
  	_.defer(function(){ 
  		if(_this.$('.info').height() > 80){
  			var parent = _this.$el.closest('.widget');
  			_this.totalHeight = parent.outerHeight();
  			parent.removeClass('allHeight');
  			parent.addClass('reduced');
	  		_this.$('.info ul').addClass('cut');
	  		_this.$('.read_more').removeClass('hide');
	  	}
	  	_this.$('.info').addClass('active');
  	});
  	return this;
  },

  _readMore:function(e){
  	e.preventDefault();
  	e.stopPropagation();
  	var _this = this;
  	this.$el.closest('.widget').css({'height':this.totalHeight});
  	this.$('.read_more').addClass('hide');
  	setTimeout(function(){
  		_this.$('.info ul').removeClass('cut'); 
  	}, 200);	
  },

  _restoreHeight:function(){
  	
  	if(this.$('.info').height() > 80){
  		this.$('.info ul').addClass('cut');
  		this.$('.read_more').removeClass('hide');
  	}
  	this.$el.closest('.widget').css({'height':''});
  }

});
