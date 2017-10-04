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

App.View.Map.Waste.Base = App.View.Map.LayerMap.extend({
  _popupTemplate: _.template( $('#map-popup_template').html()),
  _torqueSqlTemplate: _.template( $('#waste-Map-torque_summary_sql_template').html()),
  _torqueNamedmaps: false,

  initialize: function(options) {
    _.bindAll(this,'_onNamedMapCreated','_onFeatureMobaClick', '_onFeatureIssueClick');
    App.View.Map.LayerMap.prototype.initialize.call(this,options);
    this._cdbLayer = null;
    this._torquePlaceholders = {scope:options.scope,container: 1,issue:1,status_filter:0,statuses:"'blablabla'",category_filter: 0,categories: "'blablabla'"};
  },

  onClose: function(){
    App.View.Map.LayerMap.prototype.onClose.call(this);
    if (this._cdbLayer){
      this.map.removeLayer(this._cdbLayer);
      // this._cdbLayer.clear();
    }
    if (this._torqueLayer){
      this.map.removeLayer(this._torqueLayer);
      //this._torqueLayer.clear();
    }
  },

  filtersLayer: function(m){
    var filters = m.get('filters');

    //TODO: IMprove this creating a filter function for namedmaps
    if (m.get('id')=='waste.issues'){
      var opts;
      if(filters.categorias !== null) {
        opts = {
          categories: "'" + filters.categorias.join("','") + "'",
          category_filter: 1
        };
      }else if (filters.estados !== null){
        opts = {
          statuses: "'" + filters.estados.join("','") + "'",
          status_filter: 1
        };
      }
      this._cdbLayer.setParams(opts);
      this._torqueLayer.setSQL(this._torqueSqlTemplate(_.extend(this._torquePlaceholders, opts)));
    }
  },

  changeBBOX: function(){
    //TODO: update counters
  },

  toggleLayer: function(m){
    var opts = {};

    if (m.get('id') == 'MOBA'){
      //opts['container'] = this._torqueOpts['container'] = m.get('enable') ? 1 : 0;
      opts['container'] = m.get('enable') ? 1 : 0;
    }
    if (m.get('id') == 'waste.issues'){
      //opts['issue'] = this._torqueOpts['issue'] = m.get('enable') ? 1 : 0;
      opts['issue'] = m.get('enable') ? 1 : 0;
    }
    this._cdbLayer.setParams(opts);
    //this._torqueLayer.setSQL(this._torqueSqlTemplate(this._torqueOpts))
    this._torqueLayer.setSQL(this._torqueSqlTemplate(_.extend(this._torquePlaceholders, opts)));
  },

  render: function(){
    App.View.Map.LayerMap.prototype.render.call(this);

    var _this = this;

    if(this._torqueNamedmaps){

      // WAITING FOR CartoDB/cartodb#5904

      cartodb.createLayer(this.map, {
        user_name: App.config.scopes.guadalajara.cartodb_user,
        type: 'torque',
        order: 1,
        options: {
          user_name:  App.config.scopes.guadalajara.cartodb_user,
          tile_style: 'Map{-torque-frame-count:10;-torque-animation-duration:1;-torque-time-attribute:"t";-torque-aggregation-function:"CDB_Math_Mode(torque_category)";-torque-resolution:1;-torque-data-aggregation:linear;}#alert{comp-op:xor;marker-fill-opacity:0.9;marker-line-color:#FFF;marker-line-width:0;marker-line-opacity:1;marker-type:ellipse;marker-width:9;marker-fill:#00ff00;}#alert[value=2]{marker-fill:#ff3300;}#alert[value=1]{marker-fill:#ff9900;}#alert[frame-offset=1]{marker-width:14;marker-fill-opacity:0.20;}#alert[frame-offset=2]{marker-width:16;marker-fill-opacity:0.18;}#alert[frame-offset=3]{marker-width:18;marker-fill-opacity:0.17;}#alert[frame-offset=4]{marker-width:20;marker-fill-opacity:0.15;}#alert[frame-offset=5]{marker-width:22;marker-fill-opacity:0.13;}#alert[frame-offset=6]{marker-width:24;marker-fill-opacity:0.11;}#alert[frame-offset=7]{marker-width:26;marker-fill-opacity:0.09;}#alert[frame-offset=8]{marker-width:28;marker-fill-opacity:0.07;}#alert[frame-offset=9]{marker-width:30;marker-fill-opacity:0.05;}#alert[frame-offset=10]{marker-width:32;marker-fill-opacity:0.03;}'
        },
        named_map: {
          name: this.options.namedmap,
          layers: [{
            layer_name: "t"
           }]
         }
      },{https:true,time_slider: false})
      .addTo(this.map)
      .done(function(layer) {
        layer.setZIndex(1);
        _this._torqueLayer = layer;
      });

    }
    else{

      var sql = this._torqueSqlTemplate(this._torquePlaceholders);
      cartodb.createLayer(this.map, {
          type: "torque",
          options: {
              query: sql,
              user_name:  App.config.scopes.guadalajara.cartodb_user,
              cartocss: 'Map{-torque-frame-count:10;-torque-animation-duration:1;-torque-time-attribute:"t";-torque-aggregation-function:"CDB_Math_Mode(torque_category)";-torque-resolution:1;-torque-data-aggregation:linear;}#alert{comp-op:xor;marker-fill-opacity:0.9;marker-line-color:#FFF;marker-line-width:0;marker-line-opacity:1;marker-type:ellipse;marker-width:9;marker-fill:#00ff00;}#alert[value=2]{marker-fill:#ff3300;}#alert[value=1]{marker-fill:#ff9900;}#alert[frame-offset=1]{marker-width:14;marker-fill-opacity:0.20;}#alert[frame-offset=2]{marker-width:16;marker-fill-opacity:0.18;}#alert[frame-offset=3]{marker-width:18;marker-fill-opacity:0.17;}#alert[frame-offset=4]{marker-width:20;marker-fill-opacity:0.15;}#alert[frame-offset=5]{marker-width:22;marker-fill-opacity:0.13;}#alert[frame-offset=6]{marker-width:24;marker-fill-opacity:0.11;}#alert[frame-offset=7]{marker-width:26;marker-fill-opacity:0.09;}#alert[frame-offset=8]{marker-width:28;marker-fill-opacity:0.07;}#alert[frame-offset=9]{marker-width:30;marker-fill-opacity:0.05;}#alert[frame-offset=10]{marker-width:32;marker-fill-opacity:0.03;}'
          }
      }).addTo(this.map)
      .done(function(layer) {
        layer.setZIndex(1);
        _this._torqueLayer = layer;
      });

  }
    cartodb.createLayer(this.map, {
      user_name:  App.config.scopes.guadalajara.cartodb_user,
      type: 'namedmap',
      named_map: {
        name: this.options.namedmap,
        layers: [{
          layer_name: "t2",
          interactivity: "cartodb_id"
        },{
          layer_name: "t3",
          interactivity: "cartodb_id"
        }]
      }
    },{ https: true}).addTo(this.map)
    .done(this._onNamedMapCreated);

    return this;
  },

  _onFeatureMobaClick: function(e, pos, pixel, data) {

    var templateData = {
      name : 'Contenedor',
      device_id : data.id_device || data.id_entity, // Hack to avoid and update at CartoDB cache
      entity_id: 'waste.moba',
      date_start : null,
      date_finish : null,
      scope: this.options.scope,
      values: [
        {
          name: 'Nivel de llenado',
          value: data.level,
          units: '%',
          class: 'big baseline'
        }
      ],
      button_label: 'contenedor',
      disable_button: false
    };

    this._popup
      .setLatLng(pos)
      .setContent(this._popupTemplate(templateData))
      .openOn(this.map);

  },

  _onFeatureIssueClick: function(e, pos, pixel, data) {
    var templateData = {
      name : 'Incidencia',
      device_id : data.id_device || data.id_entity, // Hack to avoid and update at CartoDB cache
      entity_id: 'waste.issue',
      date_start : null,
      date_finish : null,
      scope: this.options.scope,
      values: [
        {
          name: 'Estado',
          value: App.Static.Collection.Waste.IssueStatuses.get(data.status).get('name'),
          class: 'small capitalize',
          flag: data.priority,
          flag_text: 'urgente',
          flag_class: 'alert_1'
        }
      ],
      button_label: 'incidencia',
      disable_button: true
    };

    this._popup
      .setLatLng(pos)
      .setContent(this._popupTemplate(templateData))
      .openOn(this.map);

  },

  _onNamedMapCreated: function(layer){
    App.View.Map.LayerMap.prototype._onNamedMapCreated.apply(this,[layer]);
    this._cdbLayer = layer;
    this._cdbLayer.setZIndex(2);
    layer.setParams({
      'scope': this.options.scope
    });


    this.setInteraction(layer);

    var hovers = [], _this = this;
    layer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
      hovers[layer] = 1;
      if(_.any(hovers)) {
        _this.$el.css('cursor', 'pointer');
      }
    });
    layer.bind('featureOut', function(m, layer) {
      hovers[layer] = 0;
      if(!_.any(hovers)) {
        _this.$el.css('cursor', 'auto');
      }
    });
  },

  setInteraction: function(layer){
    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(1).setInteraction(true);
    this._popup = L.popup();

    layer.getSubLayer(0).on('featureClick', this._onFeatureIssueClick);
    layer.getSubLayer(1).on('featureClick', this._onFeatureMobaClick);
  }

});

App.View.Map.Waste.SummaryMap = App.View.Map.Waste.Base.extend({

});

App.View.Map.Waste.IssuesMap = App.View.Map.Waste.Base.extend({

  _torqueSqlTemplate: _.template( $('#waste-Map-torque_issues_sql_template').html()),
  _popupTemplate: _.template( $('#waste-Map-issues_evolution_popup_template').html() ),


  initialize: function(options) {
    App.View.Map.Waste.Base.prototype.initialize.call(this,options);
    _.extend(this._torquePlaceholders, this._getDateOpts());
  },

  _onNamedMapCreated: function(layer){
    App.View.Map.Waste.Base.prototype._onNamedMapCreated.call(this, layer);
    layer.setParams(this._getDateOpts());
  },

  _getDateOpts: function(){
    var date = this._ctx.getDateRange();

    return {
      start_date: date.start,
      finish_date: date.finish
    };
  },

  changeDate: function(){
    var opts = this._getDateOpts();
    this._cdbLayer.setParams(opts);
    this._torqueLayer.setSQL(this._torqueSqlTemplate(_.extend(this._torquePlaceholders,opts)));
  },

  setInteraction: function(layer){
    layer.getSubLayer(0).setInteraction(true);
    this._popup = L.popup();
    layer.getSubLayer(0).on('featureClick', this._onFeatureIssueClick);
  },

  _onFeatureIssueClick: function(e, pos, pixel, data) {
    var date = this._ctx.getDateRange();
    var templateData = {
      name : 'Incidencia',
      device_id : data.id_device || data.id_entity, // Hack to avoid and update at CartoDB cache
      entity_id: 'waste.issue',
      device_name: data.subject.toLowerCase(),
      date_start : date.start,
      date_finish : date.finish,
      data: null,
      scope: this.options.scope,
      button_label: 'incidencia',
      disable_button: true,
      data_functions: {
        title_format: function(d){
          if(App.Static.Collection.Waste.IssueStatusesFull.get(d))
            return App.Static.Collection.Waste.IssueStatusesFull.get(d).get('name');
          else
            return d;
        },
        date_format: function(d){return App.formatDateTime(d);},
        class: function(d){
          if(App.Static.Collection.Waste.IssueStatusesFull.get(d))
            return App.Static.Collection.Waste.IssueStatusesFull.get(d).get('class');
          else
            return '';
        }
      }
    };

    var issueEvolutionModel = new App.Model.Waste.issueEvolution({
      scope: this.options.scope,
      id: data.id_entity
    });

    var _this = this;
    issueEvolutionModel.fetch({success: function(data){
      var evolutionData = data.toJSON();
      var lastStatus = data.getLastStatusByDate(_this._ctx.getDateRange().finish);
      var index = _.findIndex(evolutionData.evolution,lastStatus);
      evolutionData.evolution[index].last = true;
      templateData.data = data.toJSON();
      _this.renderPopup(pos, templateData);
    }})

    this.renderPopup(pos, templateData);
  },

  renderPopup: function(pos, templateData){
    this._popup
      .setLatLng(pos)
      .setContent(this._popupTemplate(templateData))
      .openOn(this.map);
  }
});
