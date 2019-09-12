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


App.View.Widgets.Variable = Backbone.View.extend({

  _template: _.template($('#widgets-widget_variable_template').html()),

  initialize: function (options) {
    this.options = options;
  },

  render: function () {
    var _this = this;
    this.model.fetch({
      data: this.model.options.data,
      success: function (m, data) {
        var d = m.toJSON();
        d.value = data.value[_this.options.agg.toUpperCase()];
        d.max = _this.options.max || data.value['MAX'];
        d.min = _this.options.min || data.value['MIN'];

        // label (text together units)
        d.label = (_this.options.label)
          ? _this.options.label
          : null;
        // parse value
        if (typeof _this.options.parseValue === 'function') {
          d.value = _this.options.parseValue(d.value);
        }
        // parse max value
        if (typeof _this.options.parseMaxValue === 'function') {
          d.max = _this.options.parseMaxValue(d.max);
        }
        // parse min value
        if (typeof _this.options.parseMinValue === 'function') {
          d.min = _this.options.parseMinValue(d.min);
        }
        // show reference percentage
        if (_this.options.refValue) {
          d.refPerc = 100 * (d.value / _this.options.refValue - 1);
        } else {
          d.refPerc = null;
        }

        _this.$el.html(_this._template(d));
      }
    });
    return this;
  }
});

App.View.Widgets.VariableSimple = Backbone.View.extend({

  _template: _.template($('#widgets-widget_variablesimple_template').html()),

  initialize: function (options) {
    this.options = options || {};
  },

  render: function () {

    if (this.model) {
      this.drawDataModel();
    }

    if (this.collection) {
      this.drawDataCollection();
    }

    return this;
  },

  drawDataModel: function() {
    var model = this.model.options.data;

    model.start = App.ctx.getDateRange().start;
    model.finish = App.ctx.getDateRange().finish;

    this.model.fetch({
      data: model,
      success: function (m) {
        var d = m.toJSON();

        if (!d.units) {
          d.units = null;
        }

        this.$el.html(this._template(d));
      }.bind(this)
    });
  },

  drawDataCollection: function() {
    if (this.collection.options && this.collection.options.data) {
      this.collection.options.data.time = App.ctx.getDateRange();
    }

    this.collection.fetch({
      reset: true,
      success: function (response) {
        var data = response.models.length 
          ? response.models[0].toJSON()
          : {
            value: 0,
            units: null
          };

        if (data.value === 'null'
          || data.value === null
          || data.value === ''
          || data.value === ' ') {
          data.value = 0;
        }

        if (!data.units) {
          data.units = null;
        }

        this.$el.html(this._template(data));
      }.bind(this)
    });
  },


});
