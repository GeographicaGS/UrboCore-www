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

App.View.Widgets.Base = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_base_template').html() ),

  initialize: function(options){
    this.options = options;

    this.model = new App.Model.Widgets.Base({
      title: this.options.title,
      link: this.options.link,
      titleLink: this.options.titleLink||null,
      infoTemplate: this.options.infoTemplate,
      exportable: this.options.exportable || false,
      publishable: this.options.publishable || false,
      timeMode: this.options.timeMode,
      refreshTime: this.options.refreshTime,
      dimension: this.options.dimension||'',
      type: this.options.type||'',
      correlationTitle:this.options.correlationTitle||null,
      correlationIcon:this.options.correlationIcon||null,
      embed: this.options.embed || false,
      classname: this.options.classname || '',
      context: this.options.context || App.ctx,
      bigTitle: this.options.bigTitle || false,
      extraMenu: this.options.extraMenu || null
    });

    this.ctx = this.model.get('context');

    if (this.options.start)
      this.ctx.set('start',moment.utc(this.options.start));

    if (this.options.finish)
      this.ctx.set('finish',moment.utc(this.options.finish));

    // Set a default refresh time for now widgets.
    // if (!this.model.get('refreshTime') && this.model.get('timeMode')=='now')
    //   this.model.set('refreshTime',60*1000);
    // this.listenTo(this.ctx,"change:bbox",this.refresh);

    if (!this.model.get('embed')){
      if (this.model.get('timeMode') == 'historic')
        this.listenTo(this.ctx,"change:start change:finish",this.refresh);

      this.listenTo(this.ctx,"change:bbox",this.refresh);

    }

    this.filterModel = App.getFilter(this.options.id_category);
    if (this.filterModel)
      this.listenTo(this.filterModel,'change',this._onChangeFilter);

    if (this.model.get('refreshTime')){
      this._setRefreshInterval()
    }

    this.subviews = [];
    this.filterables = [];

  },

  events: {
    'click .botons .tooltipIcon.info' : '_onClickIconInfo',
    'click .botons .tooltipIcon.close' : '_onClickIconCloseInfo',
    'click .widget_content': '_onClickContent',
    'click .botons .tooltipIcon li.exportable': '_onClickIconExport',
    'click .botons .tooltipIcon li.download': '_onClickIconExport',
    'click .botons .tooltipIcon.download': '_onClickIconExport',
    'click .botons .tooltipIcon.export': '_onClickIconExport'
  },

  hasPermissions: function() {
    if(this.model.get('embed')) return true;
    if('options' in this)
      if('permissions' in this.options)
        return App.mv().validateInMetadata(this.options.permissions);
    return true;
  },

  _setRefreshInterval: function(){
    if (this.model.get('refreshTime') && this.model.get('timeMode') == 'now'){
      if (this._refreshInterval)
        clearInterval(this._refreshInterval);

      this._refreshInterval = setInterval(function(){
        this.refresh();
      }.bind(this),this.model.get('refreshTime'));
    }
  },

  _onClickIconExport: function(e){
    e.preventDefault();
    e.stopPropagation();

    var $target = $(e.currentTarget);
    var _export = $target.data('export');


    var col = this.collection || this.dataModel;
    // var options = col.options || this.options;
    // console.log(col.options);
    // console.log(options);

    var options = JSON.parse(JSON.stringify(col.options));

    var params = options.data;
    var model = this.model;

    if(_export === 'csv') {
      // Deep copy
      options.data.csv = true;
      col.fetch({
        dataType: 'text',
        data: options.data,
        success: function(collection, response, options){
          var csv = new App.Collection.TableToCsv([], {});
          csv.parse(response);
        }
      });

    }
    else if(_export === 'publish') {
      if(this._popUpView == undefined) {
        this._popUpView = new App.View.PopUpPublish();
      }

      var modeldata = {
        b: btoa(JSON.stringify(params)),
        name: model.get('title'),
        description: null,
        widget: this.options.classname,
        scope: App.currentScope,
        payload: [{
          url: (typeof col.url === 'function') ? col.url() : col.url,
          data: params
        }]
      }

      var collection = new App.Collection.PublishedWidget([],{modeldata: modeldata});
      collection.url = App.config.api_url + '/' + App.currentScope + '/auth/widget/' + this.options.classname;

      var _this = this;
      collection.fetch({

        success: function(collection, response, options){
          _this._popUpView.internalView = new App.View.Embed({
            collection: collection
          });

          _this.$el.append(_this._popUpView.render().$el);
          _this._popUpView.show();
        },
        error: function(collection, response, options){
          console.log("ERROR");
          console.log(response);
          console.log(options);
        }
      })
    }
  },

  _onClickIconInfo: function(e){
    e.preventDefault();
    e.stopPropagation();

    this.$(".tooltipIcon.close")
      .removeClass('hide')
      .siblings().addClass('hide');
    this.$(".info_container").removeClass('hide');
    this.$(".widget_content").addClass('hide');
  },

  _onClickIconCloseInfo:function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.$(".tooltipIcon.close")
      .addClass('hide')
      .siblings().removeClass('hide');
    this.$(".info_container").addClass('hide');
    this.$(".widget_content").removeClass('hide');
  },

  _onClickContent: function(e){
    if(this.model.get('link')){
      $('.nvtooltip').css('opacity',0);
    }
  },

  _onChangeFilter: function(){
    // reset refresh interval
    this._setRefreshInterval();

    if (this.filterables.length)
      this.render();
  },

  updateFilters: function(){
    for (var i in this.filterables){
      if (!this.filterables[i].options)
        this.filterables[i].options = {data: {}};
      if (!this.filterables[i].options.data)
        this.filterables[i].options.data = {};

      var data = this.filterables[i].options.data;
      data.filters = data.filters || {};
      if(this.filterModel)
        data.filters = this.filterModel.toQuery();

      var bbox = this.ctx.getBBOX();
      if (bbox)
        data.filters.bbox = bbox;
      else if (data.filters.hasOwnProperty('bbox'))
        delete data.filters.bbox;
    }

    return this;
  },

  refresh: function() {
    this.render();
    return this;
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));

    this.updateFilters();

    for (var i in this.subviews)
      this.$('.widget_content').append(this.subviews[i].render().$el);
    return this;
  },

  onClose: function() {
    for (var i in this.subviews)
      this.subviews[i].close();

    if (this._refreshInterval)
      clearInterval(this._refreshInterval);

  },

  getDataObjectsPayloads: function(){
    var o = [];
    for (var i in this.filterables){
      o.push(this.filterables[i].payload);
    }
    return o;
  }
});
