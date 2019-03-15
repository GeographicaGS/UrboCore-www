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

App.View.Widgets.Device.DeviceRawTable = Backbone.View.extend({

  initialize: function(options) {
    this._scope = options.scope;
    this._vars = options.vars;
    this.render();
  },

  onClose: function(){

    if(this._tableView)
      this._tableView.close();

    this.stopListening();
  },

  render: function(){
    var columns = _.map(this._vars, function(el){
      return {
        key: el.id,
        title: el.name,
        unit: el.units,
        format: typeof el.format === 'function'
          ? el.format
          : false
      }
    });
    columns.unshift({
      key: 'time',
      title: 'Fecha',
      format: function(d){return App.formatDateTime(d, 'DD/MM/YYYY HH:mm:ss');}
    });
    _.each(columns, function(el){
      if(['dumps.container.datelastemptying'].indexOf(el.key) !== -1) // It is using an array to let you add more items when needed
        el.format = function(d){return App.formatDateTime(d);}
    });
    this.tableModel = new Backbone.Model({
      'title':'',
      'downloadButton':false,
      'class':'device',
      'columns': columns
    });

    this.tableCollection = new App.Collection.DeviceRaw(null,{
      scope:this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id'),
      variables: _.pluck(this._vars,'id')
    });

    this._tableView = new App.View.Widgets.TablePaginated({
      'template': $('#devices-widget_table_raw_template').html(),
      'model':this.tableModel,
      'collection':this.tableCollection
    });
    this.$el.html(this._tableView.$el);

    return this;
  },

  onContextChange: function(){
    this.tableCollection.fetch({'reset':true, data: this.tableFilter});
  },
});

App.View.Widgets.Device.DeviceTimeSerieTable = App.View.Widgets.Device.DeviceRawTable.extend({
  render: function(){
    var columns = _.map(this._vars, function(el){
      return {
        key: el.id,
        title: el.name,
        unit: el.units
      }
    });
    columns.unshift({
      key: 'time',
      title: 'Fecha',
      format: function(d){return App.formatDateTime(d);}
    });
    this.tableModel = new Backbone.Model({
      'title':'',
      'downloadButton':false,
      'class':'device',
      'columns': columns
    });
    var metadata = App.Utils.toDeepJSON(App.mv().getEntity(this.model.get('entity')));
    var entityVariables = _.filter(metadata, function(el){
      return el.units;
    });
    entityVariables = _.map(entityVariables, function(el){ return el.id});
    var varAgg = [];
    for (var i = 0; i<entityVariables.length; i++) {
      var agg = _.findWhere(metadata, {id: entityVariables[i]}).var_agg[0] || '';
      varAgg.push(agg.toLowerCase());
    }
    this.tableCollection = new App.Collection.DeviceTimeSerie(null,{
      scope:this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id'),
      vars: entityVariables,
      agg: varAgg,
      step: '1d'
    });
    this._tableView = new App.View.Widgets.TablePaginated({
      'template': $('#devices-widget_table_raw_template').html(),
      'model':this.tableModel,
      'collection':this.tableCollection
    });
    this.$el.html(this._tableView.$el);

    return this;
  },
});
