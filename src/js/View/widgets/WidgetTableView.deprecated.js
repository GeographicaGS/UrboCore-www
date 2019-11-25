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

App.View.Widgets.Deprecated.Table = Backbone.View.extend({
  _template: _.template($('#widgets-widget_table_template').html()),

  initialize: function (options) {

    this.model = options.model;
    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this._aggCollection = options.aggCollection;

    if (this._stepModel) {
      this.listenTo(this._stepModel, 'change:step', function () {
        this.onContextChange();
      });
    }

    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.render);
    this.collection.fetch({ reset: true })

    if (this._aggCollection) {
      this.listenTo(this._aggCollection, 'change', function () {
        this.onContextChange();
      });
    }

    this._ctx = App.ctx;
    this.listenTo(this._ctx, 'change:start change:finish change:bbox', this.onContextChange);

    this._tableToCsv = new App.Collection.TableToCsv()
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

    // this.render();
    this.$('h4').append(App.circleLoading());
  },

  events: {
    'click .table button': '_downloadCsv'
  },

  onClose: function () {
    this.stopListening();
  },

  render: function () {
    this.$el.html(this._template({ 
      m: this.model, 
      elements: this.collection.toJSON() 
    }));

    return this;
  },

  onContextChange: function () {
    $('.table').addClass('loading');
    this.$('.loading.circle').remove();
    this.$('h4').append(App.circleLoading());
    var _this = this;
    if (this._stepModel) {
      this.collection.options.step = this._stepModel.get('step');
    }
    if (this._aggCollection) {
      _this.collection.options.agg = '';
      _.each(this._aggCollection.toJSON(), function (j) {
        _this.collection.options.agg = j.agg + ','
      });
      this.collection.options.agg = this.collection.options.agg.slice(0, -1);
    }
    this.collection.fetch({ 'reset': true })
  },

  _downloadCsv: function () {
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    this._tableToCsv.options.format = 'csv'; // TO GET
    this._tableToCsv.fetch({
      reset: false,
      dataType: 'text',
      format: 'csv' // TO POST
    });
  },

  /**
   * TODO - Este método existe en los widgets actuales
   * no en los antiguos, como este, solo creo este
   * método vacío para poder usar estos widgets dentro
   * de los paneles "modernos" -> "App.View.Panels.Splitted"
   * 
   */
  hasPermissions: function () {
    return true;
  },

});
