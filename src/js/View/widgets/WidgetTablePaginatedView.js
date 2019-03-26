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

App.View.Widgets.TablePaginated = App.View.Widgets.Deprecated.Table.extend({
  _template: _.template( $('#widgets-widget_table_paginated_template').html() ),
  events: {
    'click .showMore': 'loadMore',
    'click .table button.downloadButton':'_downloadCsv',
    'scroll': 'emitEvent'
  },
  className: function(){
    return 'table block ' + this.model.get('class');
  },
  initialize: function(options){
    App.View.Widgets.Deprecated.Table.prototype.initialize.call(this,options);
    if(options.template){
      this._template = _.template(options.template);
    }
  },
  /**
   * Just broadcasts the scroll event up the tree when this table element ($el) is being scrolled
   * 
   * @param {Object Event} event 
   */
  emitEvent: function(event){
    this.trigger('table:'+ event.type, event);  //Broadcast the event named: table:scroll

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
