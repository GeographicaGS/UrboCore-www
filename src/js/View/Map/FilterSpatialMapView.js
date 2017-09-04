'use strict';

App.View.Map.FilterSpatial = Backbone.View.extend({
  _template: _.template( $('#map-filter_spatial_template').html()),

  initialize: function(options) {
    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:bbox_status change:bbox_info',this.render);
  },

  events: {
  	'click .button_filter' : '_toggleFilter',
  	'click .info a' : '_closeInfo',
  },

  onClose: function(){
      this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({
      info: this._ctx.get('bbox_info'),
      status: this._ctx.get('bbox_status')
    }));

    return this;
  },

  _toggleFilter:function(e){
  	this._ctx.set('bbox_status',!this._ctx.get('bbox_status'));
  },

  _closeInfo:function(e){
  	e.preventDefault();
  	e.stopPropagation();
  	this._ctx.set('bbox_info',false);
  }

});
