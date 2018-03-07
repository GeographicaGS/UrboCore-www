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

App.View.Widgets.Table =  Backbone.View.extend({

  _template: _.template( $('#base_table_template').html() ),

  initialize: function(options) {

    this.options = _.defaults(options,{
      listenContext: true,
      context: App.ctx
    });

    this._listenContext = this.options.listenContext;
    this.model = options.model;
    this.collection = options.data;
    this.ctx = options.context;

    if(this._listenContext)
      this.collection.options.data = {};

    this.listenTo(this.collection,"reset",this._drawTable);

    if(options['template']){
      this._template = options['template'];
    }

    this._tableToCsv = new App.Collection.TableToCsv()
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

    _.bindAll(this, '_showTooltip');

  },

  events: {
    'click .table button':'_downloadCsv'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.append(App.widgetLoading());
    if(this._listenContext){
      if (this.model.get('method')=='GET')
        _.extend(this.collection.options.data, this.ctx.getDateRange());
      else
        this.collection.options.data.time = this.ctx.getDateRange();
    }

    this.collection.fetch({reset: true, data: this.collection.options.data});

    return this;
  },

  _drawTable:function(){
    this.$el.html(this._template({m:this.model, elements:this.collection.toJSON()}));
    this.delegateEvents(this.events);
  },

  _downloadCsv:function(){
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    this._tableToCsv.options.format = 'csv';

    this._tableToCsv.options.reset = false;
    this._tableToCsv.options.dataType = 'text'

    // this._tableToCsv.fetch({'reset':false,'dataType':'text'})
    this._tableToCsv.fetch(this._tableToCsv.options);
  },

  _showTooltip: function(element) {
    if (!this.$el.find('.tooltip').get().length) {
      this.$el.append("<span class='tooltip'>" + element.currentTarget.getAttribute('data-tooltip') + "</span>");
    } else {
      $(".tooltip").html(element.currentTarget.getAttribute('data-tooltip'));
    }

    $(".tooltip").css('top', element.clientY - 400);
    $(".tooltip").css('left', element.clientX + 20 - 200);
  }

});

App.View.Widgets.TableNewCSV =  App.View.Widgets.Table.extend({
  events: {
    'click .table button':'_downloadCsv'
  },
  initialize: function(options) {
      this.options = _.defaults(options,{
        listenContext: true,
        context: App.ctx
      });
  
      this._listenContext = this.options.listenContext;
      this.model = options.model;
      this.collection = options.data;
      this.ctx = options.context;

      this.listenTo(this.collection,"reset",this._drawTable);
      
      if(options['template']){
        this._template = options['template'];
      }
  
      this._tableToCsv = new App.Collection.TableToCsv()
      this._tableToCsv.url = this.collection.url;
      this._tableToCsv.fetch = this.collection.fetch;
  
      _.bindAll(this, '_showTooltip');
  },

  _downloadCsv:function(){
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    this._tableToCsv.options.data.csv = true;

    this._tableToCsv.options.reset = false;
    this._tableToCsv.options.dataType = 'text'

    // this._tableToCsv.fetch({'reset':false,'dataType':'text'})
    this._tableToCsv.fetch(this._tableToCsv.options);
  }
});
