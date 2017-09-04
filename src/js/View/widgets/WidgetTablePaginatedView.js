'use strict';

App.View.Widgets.TablePaginated = App.View.Widgets.Deprecated.Table.extend({
  _template: _.template( $('#widgets-widget_table_paginated_template').html() ),
  events: {
    'click .showMore': 'loadMore',
    'click .table button.downloadButton':'_downloadCsv'
  },
  initialize: function(options){
    App.View.Widgets.Deprecated.Table.prototype.initialize.call(this,options);
    if(options.template){
      this._template = _.template(options.template);
    }
  },
  loadMore: function(e){
    e.preventDefault();
    $('.table').addClass('loading');
    $('.button.showMore').addClass('loading');
    var expectedLength = this.collection.length + this.collection.options.pageSize;
    this.collection.nextPage();
    this.collection.fetch({remove: false, success: function(response){
      $('.table').removeClass('loading');
      if(response.length > expectedLength)
        $('.button.showMore').removeClass('loading');
      else
        $('.button.showMore').addClass('hide').removeClass('loading');
    }});
  },
  render: function(){
  	this.$el.html(this._template({'m':this.model, 'elements':this.collection.toJSON(), 'pageSize': this.collection.options.pageSize}));
    return this;
  },
});
