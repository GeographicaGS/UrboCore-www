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

App.View.DevicePeriod = Backbone.View.extend({

  _template: _.template($('#devices-period_template').html()),

  events: {
    'click span.download': '_downloadCsv'
  },

  _downloadCsv: function () {
    var metadata = App.Utils.toDeepJSON(App.mv().getEntity(this.model.get('entity')).get('variables'));
    var entityVariables = _.filter(metadata, function (el) {
      return el.config ? el.config.active : el.units;
    });
    var vars = _.pluck(entityVariables, 'id');

    const dateRange = App.ctx.getDateRange();
    this.collection = new Backbone.Model();
    this.collection.url = App.config.api_url + '/' + App.currentScope + '/devices/' + this.model.get('entity') + '/' + this.model.get('id') + '/raw',
      this.collection.fetch({
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        data: JSON.stringify({
          "time": {
            start: moment.utc(dateRange.start).startOf('day').format(),
            finish: moment.utc(dateRange.finish).endOf('day').format(),
          },
          "id_entity": this.model.get('id'),
          "vars": vars,
          "format": "csv"
        })
      });
    this.collection.parse = function (response) {
      var blob = new Blob([response], { type: 'text/csv' });
      var csvUrl = window.URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.setAttribute("href", csvUrl);
      link.setAttribute("download", "download.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  render: function () {

    this.$el.html(this._template({ m: this.model.toJSON() }));

    this._summaryView = new App.View.DeviceSumary({ el: this.$('#summary'), model: this.model });

    var metadata = App.Utils.toDeepJSON(App.mv().getEntity(this.model.get('entity')).get('variables'));
    var entityVariables = _.filter(metadata, function (el) {
      return (el.config ? el.config.active : el.units) && (el.var_agg && el.var_agg.length && el.var_agg[0] !== "NOAGG");
    });
    var varAgg = {};
    for (var i = 0; i < entityVariables.length; i++) {
      var agg = _.findWhere(metadata, { id: entityVariables[i].id }).var_agg[0] || '';
      varAgg[entityVariables[i].id] = agg.toLowerCase();
    }

    var multiVariableModel = new Backbone.Model({
      category: '',
      title: __('Evolución'),
      aggDefaultValues: varAgg
    });

    // Get variables domains
    var yDomains = {};
    _.each(entityVariables, function (elem) {
      if (elem.config && elem.config.local_domain)
        yDomains[elem.id] = elem.config.local_domain;
    });
    if (Object.keys(yDomains > 0)) {
      multiVariableModel.set({ yAxisDomain: yDomains });
    }

    var stepModel = new Backbone.Model({
      'step': '1d'
    });

    var entityVariablesIds = _.map(entityVariables, function (el) { return el.id });
    this.entityVariablesIds = entityVariablesIds;

    var multiVariableCollection = new App.Collection.DeviceTimeSerieChart([], {
      scope: this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id'),
      vars: entityVariablesIds,
      id: this.model.get('id'),
      step: '1h',
      data: {
        time: {}
      }
    });

    this._chartView = new App.View.Widgets.MultiVariableChart({
      el: this.$('#chart'),
      collection: multiVariableCollection,
      multiVariableModel: multiVariableModel,
      stepModel: stepModel
    });

    return this;
  },

  onClose: function () {
    this.stopListening();
    if (this._chartView) this._chartView.close();
    if (this._summaryView) this._summaryView.close();
    if (this._tableView) this._tableView.close();
  },

});

App.View.DeviceRaw = Backbone.View.extend({

  _template: _.template($('#devices-raw_template').html()),

  events: {
    'change select': '_changedSelect',
  },

  _changedSelect: function (e) {
    var $e = $(e.target);
    this.model.set($e.attr('id'), $e.val());
  },

  render: function () {
    this.$el.html(this._template());

    this.$('select#time').val(this.model.get('time'));

    this._chartView = new App.View.Widgets.MultiVariableChart({
      el: this.$('#chart'),
      collection: this.getMultiVariableDataCollection(),
      multiVariableModel: this.getMultiVariableChartModel(),
      noAgg: true
    });

    this._tableView = new App.View.Widgets.CustomDeviceRawTable({
      el: this.$('#table'),
      scope: this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id'),
      variables: this.getTableVariables()
    }).render();

    return this;
  },

  /**
   * Get metadata from entity variables
   * 
   * @return {Array} metadata
   */
  getMetadataVariables: function () {
    var metadata = App.Utils.toDeepJSON(
      App.mv().getEntity(this.model.get('entity')).get('variables')
    );

    return _.filter(metadata, function (el) {
      return el.config &&
        el.config.active &&
        el.var_agg &&
        el.var_agg[0].toLowerCase() !== 'noagg';
    });
  },

  /**
   * Get model to multivariableChart
   * 
   * @return {Object} setup options
   */
  getMultiVariableChartModel: function () {
    var metadataVariables = this.getMetadataVariables();
    var aggDefaultValues = _.reduce(metadataVariables, function (sumAgg, variable) {
      if (variable.var_agg[0]) {
        sumAgg.push(variable.var_agg[0].toLowerCase());
      }
      return sumAgg;
    }, []);
    var yAxisDomain = _.reduce(metadataVariables, function (sumYAxisDomain, variable) {
      if (variable.config && variable.config.local_domain) {
        sumYAxisDomain[variable.id] = variable.config.local_domain;
      }
      return sumYAxisDomain;
    }, {});

    return new Backbone.Model({
      title: __('Evolución'),
      aggDefaultValues: aggDefaultValues,
      yAxisDomain: Object.keys(yAxisDomain > 0)
        ? yAxisDomain
        : null
    });
  },

  /**
   * Get data from multiVariableChart
   * 
   * @return {Object} data collection
   */
  getMultiVariableDataCollection: function () {
    var metadataVariables = this.getMetadataVariables();
    var multiVariableDataCollection = new App.Collection.DeviceRaw([], {
      scope: this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id'),
      variables: _.pluck(metadataVariables, 'id'),
      data: {
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish
        }
      }
    });

    multiVariableDataCollection.parse =
      App.Collection.Variables.Timeserie.prototype.parse;

    return multiVariableDataCollection;
  },

  /**
   * Get the table variables to draw it
   * 
   * @return {Array} - the definition to each field
   */
  getTableVariables: function () {
    var metadataVariables = this.getMetadataVariables();
    var initVariables = [
      {
        id: 'date',
        title: __('Fecha'),
        format: {
          type: 'date'
        }
      }
    ];

    return _.reduce(metadataVariables, function (sumVariables, variable) {
      sumVariables.push({
        id: variable.id,
        title: variable.name,
        format: {
          type: 'numeric'
        }
      });
      return sumVariables;
    }, initVariables);
  },

  onClose: function () {
    this.stopListening();

    if (this._chartView) {
      this._chartView.close();
    }

    if (this._tableView) {
      this._tableView.close();
    }
  }

});

App.View.DeviceLastData = Backbone.View.extend({
  _template: _.template($('#devices-lastdata_template').html()),

  initialize: function (options) {
    _.bindAll(this, '_onModelFetched');
  },

  onClose: function () {
    if (this._widgetViews) {
      for (var i = 0; i < this._widgetViews.length; i++) {
        this._widgetViews[i].close();
      }
    }
    this.stopListening();
  },

  render: function (e) {

    var _this = this;
    this.collection = new Backbone.Collection();
    this.collection.url = this.model.durl() + '/' + this.model.get('entity') + '/' + this.model.get('id') + '/lastdata';
    this.listenTo(this.collection, 'reset', this._onModelFetched);
    this.$el.append(App.circleLoading());
    this.collection.fetch({
      'reset': true, 'error': function () {
        _this.$el.html('<div class="device-no-data">' + __('No hay datos para este dispositivo') + '</div>');
      }
    });


    return this;
  },

  _onModelFetched: function () {
    var lastdata = this.collection.toJSON()[0].lastdata;
    var timeinstant = this.collection.toJSON()[0].timeinstant

    this._widgetViews = [new App.View.LastDataWidgetMap({
      model: new Backbone.Model({
        icon: this.model.get('icon'),
        lat: this.collection.toJSON()[0].location.lat,
        lng: this.collection.toJSON()[0].location.lng
      })
    })];
    var legacyScopes = ['andalucia', 'osuna', 'guadalajara'];
    if (legacyScopes.indexOf(this.model.get('scope')) !== -1) {

      for (var i = 0; i < lastdata.length; i++) {
        var var_id = lastdata[i].var_id;
        var model = new Backbone.Model({
          'className': 'col-md-4',
          'var_id': var_id,
          'var_value': lastdata[i].var_value,
          'timeinstant': timeinstant
        });

        if (
          var_id == 'waste.moba.s_class'
          || var_id == 'waste.moba.sensor_code'
          || var_id == 'waste.issue.category'
          || var_id == 'waste.issue.status'
          || var_id == 'mt_winddir'
          || var_id == 'ev_state'
          || var_id == 'ev_type'
          || var_id == 'tu_activlocality') {

          var v = new App.View.LastDataWidgetSimple({ 'model': model })
        } else if (App.mv().getVariable(var_id).get('var_thresholds') !== null) {
          var v = new App.View.Widgets.Gauge({ 'model': model })
        }
        if (v)
          this._widgetViews.push(v);
      }
    } else {
      // New scopes
      for (var i = 0; i < lastdata.length; i++) {
        var var_id = lastdata[i].var_id;
        var varMetadata = App.mv().getVariable(var_id);
        var varConfig = varMetadata ? varMetadata.get('config') : null;

        if (varConfig && varConfig.widget) {
          var model = new Backbone.Model({
            className: 'col-md-4',
            var_id: var_id,
            var_value: lastdata[i].var_value,
            timeinstant: timeinstant
          });
          var widget = null;
          switch (varConfig.widget) {
            case 'gauge':
              if (varMetadata.get('var_thresholds')) {
                if (this.model.get('entity') !== 'indoor_air.quality') {
                  widget = new App.View.Widgets.Gauge({
                    model: model
                  });
                } else {
                  widget = new App.View.Widgets.GaugeCustom({
                    model: model
                  });
                }

              }
              break;
            case 'fillbar':
              widget = new App.View.Widgets.Device.FillBar({
                title: __(varMetadata.get('name')),
                data: {
                  variable: var_id,
                  value: lastdata[i].var_value,
                  max: varConfig.local_domain ? varConfig.local_domain[1] : 100,
                },
                thresholds: varMetadata.get('var_thresholds') ? [varMetadata.get('var_thresholds')[1], varMetadata.get('var_thresholds')[2]] : [80, 90]
              });
              break;
            case 'variable':
              widget = new App.View.LastDataWidgetSimple({
                model: model,
              });
              break;
            case 'variable_indicator':
              widget = new App.View.LastDataWidgetSimple({
                model: model,
                indicator: _.find(lastdata, function (l) {
                  return l.var_id === model.get('var_id') + '_indicator'
                }),
                category: this.model.get('category'),
                withIndicator: true,
              });
              break;
          }
          if (widget)
            this._widgetViews.push(widget);
        }
      }
    }

    this._customWidgets();
    this.$el.html(this._template({ m: this.model.toJSON() }));
    for (var i = 0; i < this._widgetViews.length; i++) {
      this.$('.widget_container').append(this._widgetViews[i].el);
      this._widgetViews[i].render();
    }
  },

  _customWidgets: function () {

  }


});

App.View.LastDataWidget = Backbone.View.extend({
  className: 'col-md-4',

  _template: _.template(''),

  initialize: function (options) {

  },

  render: function () {
    this.$el.html(this._template({ m: this.model ? this.model.toJSON() : null }));

    // Let's make an square widget
    var $widget = this.$('.widget');
    $widget.height($widget.width());

  }

});

App.View.LastDataWidgetSimple = App.View.LastDataWidget.extend({

  _template: _.template($('#devices-lastdata_chart_template').html()),

  initialize: function (options) {
    this.withIndicator = options.withIndicator;
    this.category = options.category;
    this.indicator = options.indicator;
  },

  render: function () {
    this.$el.html(this._template({
      m: this.model ? this.model.toJSON() : null,
      category: this.category,
      withIndicator: this.withIndicator,
      indicator: this.indicator
    }));
    this.$('.chart').remove();
    this.$('.co_value').addClass('textleft');
    this.$('.widget').addClass('reduced')
    return this;
  }
});

/**
 * This view show a Widget like "LastDataWidgetSimple" but with more stuffs :D
 */
App.View.LastDataWidgetComplex = App.View.LastDataWidgetSimple.extend({

  _template: _.template($('#devices-lastdata_chart_complex_template').html()),

  initialize: function (options) {
    // Get metadata params
    // and we complete the parameters
    if (this.model.has('params')) {
      var currentParams = this.model.get('params');
      var parseCurrentParams = _.reduce(currentParams, function (sumParams, param) {
        var currentMetadata = App.Utils.toDeepJSON(App.mv().getVariable(param.id));

        sumParams.push({
          id: param.id,
          value: param.value,
          label: currentMetadata.name,
          units: currentMetadata.units,
          extraData: param.extraData || null,
        });

        return sumParams;
      }.bind(this), []);
      // remove from model the old parameter
      this.model.unset('params');
      // create new parameters with the new data
      this.model.set('params', parseCurrentParams);
      // Set title for widget
      if (!this.model.has('title')) {
        this.model.set('title', parseCurrentParams[0].label);
        this.model.set('customTitle', true);
      }
    }

  },

  render: function () {
    this.$el.html(this._template(this.model.toJSON()));

    return this;
  }
});

App.View.LastDataWidgetMap = App.View.LastDataWidget.extend({
  _template: _.template($('#devices-lastdata_map_template').html()),

  initialize: function (options) {

    // Default options (new options)
    options = _.defaults(options, {
      icons: [], // to draw more than one icon
      lat: null, // center map (latitude)
      lng: null // center map (longitude)
    });

    // Initialize model with data from the "options"
    if (!this.model) {
      this.model = new Backbone.Model(options);
    } else {
      if (this.model.has('icon')) {
        this.model.set('icons', [
          {
            icon: this.model.get('icon'),
            lat: this.model.get('lat'),
            lng: this.model.get('lng')
          }
        ]);
      }
    }
  },

  render: function () {

    // Apply render function parent
    App.View.LastDataWidget.prototype.render.apply(this);

    // TODO: Create MAP
    this.map = new L.Map(this.$('#devicemap')[0], {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      attributionControl: false
    });

    // Add base layer
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(this.map);

    // Add icons to map
    var icons = this.model.get('icons');
    if (icons.length) {
      _.each(icons, function (icon) {
        var iconOptions = L.icon({
          iconUrl: '/img/' + icon.icon,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, 0],
          className: icon.className || '',
        });
        var iconPosition = [
          icon.lat,
          icon.lng
        ];

        // Add marker (icon)
        L.marker(iconPosition, {
          icon: iconOptions
        })
          .addTo(this.map);
      }.bind(this));

      // Set center the map
      this.map.setView([this.model.get('lat'), this.model.get('lng')], 16);
    }

    return this;
  }

});

App.View.DeviceTimeWidget = Backbone.View.extend({

  initialize: function (options) {

    this._raw = options.raw === true || false;

    this.listenTo(App.ctx, 'change:start change:finish', this._fetchCollection);
    this.listenTo(this.model, 'change:agg', this._fetchCollection);
    this.listenTo(this.model, 'change:lastupdate', this._fetchCollection);

    this.listenTo(this.collection, 'reset', this.render);
    this._fetchCollection();

  },

  _fetchCollection: function () {

    // var agg = this._raw ? 'raw' : (this.model.get('current_agg') ? this.model.get('current_agg').join(','): null);
    var agg = [];
    if (this._raw) {
      agg = 'raw';
    } else if (this.model.get('current_agg')) {
      if (this.model.get('current_agg').length !== undefined)
        agg = this.model.get('current_agg').join(',');
      else
        agg = _.map(this.model.get('current_agg'), function (k, v) { return k }).join()
    }

    var vars = this._raw ? null : (this.model.get('vars') ? this.model.get('vars').join(',') : null);
    // agg = agg == undefined ? null:agg;

    // this.model.set('current_agg',agg);
    var time = App.ctx.getDateRange();

    this.collection.fetch({
      reset: true,
      data: {
        // time: this.model.get('time'),
        // vars: this.model.get('vars').join(','),
        // devices: this.model.get('id'),
        // agg: this.model.get('current_agg').join(',')
        devid: this.model.get('id'),
        deventity: this.model.get('entity'),
        start: time.start,
        finish: time.finish,
        vars: vars,
        agg: agg
      }
    });
  },

  onClose: function () {
    this.stopListening();
  }

});

App.View.DeviceTable = App.View.DeviceTimeWidget.extend({
  _template: _.template($('#devices-table_template').html()),

  initialize: function (options) {
    this.collection = new App.Collection.DeviceTimeSerie(null, {
      scope: this.model.get('scope'),
      entity: this.model.get('entity'),
      device: this.model.get('id')
    });
    // call parent class
    App.View.DeviceTimeWidget.prototype.initialize.call(this, options);
  },

  render: function () {
    this.$el.html(this._template({ c: this.collection.toJSON()[0], m: this.model.toJSON() }));
    return this;
  }
});

App.View.DeviceSumary = App.View.DeviceTimeWidget.extend({
  _template: _.template($('#devices-summary_template').html()),

  events: {
    //'change select': '_changedSelect',
    'click ul[data-variable] li': '_changeVarAgg',
  },

  initialize: function (options) {

    // merge with "default" options
    options = _.defaults(options, {
      hideVariableEmpty: false,
    });
    this.options = options;

    var _this = this;
    this.metadata = App.Utils.toDeepJSON(App.mv().getEntity(this.model.get('entity')).get('variables'));
    this.entityVariables = _.filter(this.metadata, function (el) {
      return el.config ? el.config.active : el.units;
    });

    this.entityVariables = _.map(this.entityVariables, function (el) { return el.id }).sort();

    this.collection = new Backbone.Collection();
    for (var i = 0; i < this.entityVariables.length; i++) {
      var meta = _.findWhere(this.metadata, { id: this.entityVariables[i] });
      var model = new App.Model.Post({
        id: this.entityVariables[i],
        aggs: meta.var_agg,
        current_agg: meta.var_agg[0],
        device: this.model.get('id'),
        name: meta.name,
        units: meta.units,
        color: App.getSensorVariableColor(i)
      });
      model.url = App.config.api_url + '/' + this.model.get('scope') + '/variables/' + this.entityVariables[i] + '/historic';
      this.collection.push(model);
      this._fetchModel(model);
    }

    this.listenTo(App.ctx, 'change:start change:finish', function () {
      _.each(_this.collection.models, function (m) {
        _this._fetchModel(m);
      });
    });

    if (options.template)
      this._template = _.template($(options.template).html())


    this.render();
  },

  _fetchModel: function (model) {
    var _this = this;
    var el = this.$('li[variable="' + model.get('id') + '"]');
    if (el.length > 0)
      el.find('.summary_block').html(App.circleLoading())

    model.fetch({
      data: {
        agg: model.get('current_agg'),
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish
        },
        filters: {
          condition: { id_entity__eq: this.model.get('id') }
        }
      },
      success: function (data) {
        _this.$('ul.row .loading').remove();

        // Defaults values
        _this.options = _.defaults(_this.options || {}, { hideVariableEmpty: false });
        // Show widget if the condition is agree
        if (_this.options.hideVariableEmpty === false
          || (_this.options.hideVariableEmpty && data.get('value') !== null)) {

          // Custom values from "model"
          if (_this.model.has('device_summary_custom_values')) {
            var customValues = _this.model.get('device_summary_custom_values');

            // set custom value
            if (customValues[data.get('id')]) {
              var newValue = data.get('value') === null
                ? '--'
                : customValues[data.get('id')][data.get('value')];

              data.set('value', newValue);
            }
          }

          if (el.length > 0) {
            el.replaceWith(_this._template({ m: data.toJSON() }));
          } else {
            _this.$('ul.row').append(_this._template({ m: data.toJSON() }));
          }
        }
      }
    });
  },

  render: function () {
    this.$el.html('<ul class="row">' + App.circleLoading() + '</ul>');
    // this.metadata = _.indexBy(this.metadata, function(el){ return el.id; });

    // var agg = [];
    // if(this.collection.toJSON()[0] && this.collection.toJSON()[0].metadata){
    //   _.each(this.collection.toJSON()[0].metadata.varagg,function(aggs){
    //     agg.push(aggs[0].toLocaleLowerCase());
    //   });
    //   !this.model.get('vars') ? this.model.set('vars', this.collection.toJSON()[0].metadata.vars):null;
    // }
    // !this.model.get('current_agg') || this.model.get('current_agg').length == 0 ? this.model.set('current_agg', this.varAgg):[];

    // this.$el.html(this._template({c: this.collection.toJSON()[0], m: this.model.toJSON(), metadata: this.metadata}));

    return this;
  },

  _changeVarAgg: function (e) {
    e.preventDefault();
    var $e = $(e.target),
      variable = $e.parent().attr('data-variable'),
      agg = $e.attr('data-agg');

    var model = this.collection.get(variable);
    model.set('current_agg', agg);
    this._fetchModel(model);

    // this.model.get('current_agg')[variable] = agg;

    // // trigger model update
    // this.model.set({
    //   'lastupdate' : new Date()
    // });
  },
});
