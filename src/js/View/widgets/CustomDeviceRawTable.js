// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

App.View.Widgets.CustomDeviceRawTable = App.View.Widgets.Base.extend({

  initialize: function (options) {
    options = _.defaults(options, {
      title: __('Datos brutos'),
      dimension: 'fullWidth bgWhite custom-device-raw-table',
      timeMode: 'historic',
      variables: []
    });

    //this._variables = options.variables;

    _.bindAll(this, 'parseCollectionTable');

    // Init parent class
    App.View.Widgets.Base.prototype.initialize.call(this, options);

    var rawTable = new App.View.Widgets.Table({
      model: this.getTableSetup(),
      data: this.getTableCollection(),
      listenContext: true,
    });

    // Add Table to the "widget content"
    this.subviews.push(rawTable);
  },

  getTableCollection: function () {
    var tableCollection = new App.Collection.DeviceRaw(null, {
      scope: this.options.scope,
      entity: this.options.entity,
      device: this.options.device,
      variables: _.pluck(this.getEntityVariables(), 'id')
    });

    tableCollection.parse = this.parseCollectionTable;

    return tableCollection;
  },

  parseCollectionTable: function (response) {
    //parse response with own variable name as key
    return _.map(response, function (row) {
      var parsedRow = {}
      _.extend(parsedRow, { date: row.time }, row.data)
      return parsedRow
    });
  },

  getTableSetup: function () {
    return new Backbone.Model({
      csv: true,
      scrollTopBar: true,
      columns_format: this.getColumnsFormat()
    });
  },

  getColumnsFormat: function () {
    var _this = this
    var columnsFormat = {}
    _.map(this.options.variables, function (variable) {
      var formatFN = null;

      if (typeof variable.format === 'function') {
        formatFN = variable.format;
      } else {
        switch (variable.format) {
          case 'numeric':
            formatFN = _this.numericFn(variable.id);
            break;
          case 'boolean':
            formatFN = _this.booleanFn;
            break;
          case 'boolean2':
            formatFN = _this.boolean2Fn;
            break;
          case 'date':
            formatFN = _this.dateFn;
            break;
        }
      }

      columnsFormat[variable.id] = {
        title: variable.title,
        formatFN: formatFN
      };
    });

    return columnsFormat;
  },
  /**
   * Get entity's variables
   *
   * @return {Array} - variables
   */
  getEntityVariables: function () {
    // All entity variables filtered by
    // "config.active" (activated) and order
    var entityVariables = App.Utils.toDeepJSON(
      App.mv()
        .getEntity(this.options.entity)
        .get('variables')
    )
      .filter(function (variable) {
        return variable.config && variable.config.active;
      })

    return entityVariables;
  },

  numericFn: function (id) {
    var _this = this;
    var units = _this.getVariableUnits(id)

    return function (value) {
      if(value != Number.parseInt(value)){
        value = App.nbf(value)
      }
      return value + ( units
        ? ' ' + units
        : '' );
    }
  },

  booleanFn: function (value) {
    return value ? __('Activa') : __('No activa');
  },

  boolean2Fn: function (value) {
    return value ? __('Si') : __('No');
  },

  dateFn: function (value) {
    return App.formatDateTime(value);
  },

  getVariableUnits: function (id) {
    var variable = this.getEntityVariables().find(function (obj) {
      return obj.id === id;
    });

    return variable.units;
  }
})