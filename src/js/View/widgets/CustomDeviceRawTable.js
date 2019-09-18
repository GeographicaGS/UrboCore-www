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

App.View.Widgets.CustomDeviceRawTable = App.View.Widgets.Base.extend({

  initialize: function (options) {
    options = _.defaults(options || {}, {
      title: __('Datos brutos'),
      dimension: 'fullWidth bgWhite custom-device-raw-table',
      timeMode: 'historic',
      csv: true,
      scrollTopBar: true,
      variables: []
    });

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
      csv: this.options.csv,
      scrollTopBar: this.options.scrollTopBar,
      columns_format: this.getColumnsFormat(),
      paginator: true
    });
  },

  getColumnsFormat: function () {
    var columnsFormat = {};
    var variablesWithMetadata = this.getEntityVariables()
    var formatFN = null;

    _.map(this.options.variables, function (variable) {
      //Set Title
      if (typeof variable.title === 'undefined') {
        var targetVariable = _.find(variablesWithMetadata, function (varWithMeta) {
          return varWithMeta.id === variable.id
        });
        variable['title'] = targetVariable
          ? targetVariable.name
          : '';
      }
      //Set Format
      if (typeof variable.format === 'function') {
        formatFN = variable.format;
      } else {
        switch (variable.format.type) {
          case 'numeric':
            formatFN = this.numericFn(variable.id, variable.format.options);
            break;
          case 'boolean':
            formatFN = this.booleanFn(variable.format.options);
            break;
          case 'date':
            formatFN = this.dateFn;
            break;
          default:
            formatFN = this.numericFn(variable.id, variable.format.options);
        }
      }

      columnsFormat[variable.id] = {
        title: variable.title && variable.title !== null && variable.title !== ''
          ? __(variable.title)
          : '',
        formatFN: formatFN
      };
    }.bind(this));

    return columnsFormat;
  },
  /**
   * Get entity's variables
   *
   * @return {Array} - variables
   */
  getEntityVariables: function () {
    var metadata = App.Utils.toDeepJSON(
      App.mv()
        .getEntity(this.options.entity)
        .get('variables')
    );

    return _.filter(metadata, function (el) {
      return el.config
        && ((typeof el.config.active === 'boolean' && el.config.active)
          || (typeof el.config.active === 'string' && el.config.active.toLowerCase() === 'true'));
    });
  },

  numericFn: function (id, options) {
    var units = this.getVariableUnits(id);

    return function (value) {
      if (value != Number.parseInt(value)) {
        value = App.nbf(value, options);
      }
      return value + (units
        ? ' ' + units
        : '');
    }.bind(this)
  },

  booleanFn: function (format) {
    var isTrue = __('Sí');
    var isFalse = __('No');

    if (format && typeof format.true != 'undefined' && typeof format.false != 'undefined') {
      isTrue = format.true;
      isFalse = format.false;
    }

    return function (value) {
      return value ? isTrue : isFalse;

    }
  },

  dateFn: function (value) {
    return App.formatDateTime(value);
  },

  getVariableUnits: function (id) {
    var variable = this.getEntityVariables().find(function (obj) {
      return obj.id === id;
    });

    if (variable) {
      return variable.units;
    }

    return;
  }
})
