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

// defaults values for every datepicker
$.datepicker.regional['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ],
  dayNamesShort: [
    'D',
    'L',
    'M',
    'X',
    'J',
    'V',
    'S'
  ],
  dayNamesMin: [
    'D',
    'L',
    'M',
    'X',
    'J',
    'V',
    'S'
  ],
};
$.datepicker.setDefaults($.datepicker.regional['es']);

App.View.Date = Backbone.View.extend({

  _template: _.template($('#date_template').html()),

  initialize: function (options) {
    // default options
    options = _.defaults(options || {}, {
      dateFormat: 'dd/mm/yy',
      compact: null,
      model: App.ctx, //context dates
      maxRange: moment.duration(1, 'year'),
      minDate: null,
      maxDate: null
    });

    // To use in other View parts
    this.options = options;

    this._setMinAndMaxDatesToModel();

    // Events - Change dates model (App.ctx)
    this.listenTo(this.options.model, 'change:start change:finish', this._setValuesInDatePickers);
    // Events - Change date limits
    this.on('change:minDate change:maxDate', this._setMinAndMaxDatesToModel, this);
    // Enabled o disabled date
    this.listenTo(this.options.model, 'change:mapTooltipIsShow', this._enabledDate);

    _.bindAll(this, '_placeDatePicker');
  },

  events: {
    'mouseup .date': '_datepickerPosition',
    'click .range_selector': '_toggleRangeValues',
    'click .range_values li': '_rangeSelected',
    'change .date.start, .date.finish': '_dateChange',
    'mouseover': '_removeCompact',
    'mouseleave': '_addCompact'
  },

  render: function () {
    var isHighRangeCtx = false;
    var isCrazyRangeCtx = false;
    var datepickerOptions = {
      dateFormat: this.options.dateFormat,
      beforeShow: this._placeDatePicker,
      changeMonth: true,
      changeYear: true,
      onClose: function () {
        this._close_datepicker();
      }.bind(this)
    };

    if (this.options.maxRange.asDays() >= 365 && this.options.maxRange.asDays() < 36500) {
      isHighRangeCtx = true;
    } else if (this.options.maxRange.asDays() >= 36500) {
      isHighRangeCtx = true;
      isCrazyRangeCtx = true;
    }

    // Draw the template in DOM
    this.setElement(
      this._template({
        isHighRangeCtx: isHighRangeCtx,
        isCrazyRangeCtx: isCrazyRangeCtx
      })
    );
    
    // Initialize the jQuery datepicker
    this.$('.date').datepicker(datepickerOptions);

    this._setValuesInDatePickers();

    if (this.options.compact) {
      this.$el.addClass('compact');
    }

    return this;
  },

  /**
   * Event triggered when the parámeters "options.minDate"
   * and "options.maxDate" are changed
   */
  _setMinAndMaxDatesToModel: function () {
    // Set "minDate"
    if (this.options.minDate instanceof Date) {
      if (this.options.maxDate instanceof Date) {
        if (moment(this.options.model.get('start')).isBefore(this.options.minDate)
          || moment(this.options.model.get('start')).isAfter(this.options.maxDate)) {
          this.options.model.set('start', moment(this.options.minDate));
        }
      } else {
        if (moment(this.options.model.get('start')).isBefore(this.options.minDate)) {
          this.options.model.set('start', moment(this.options.minDate));
        }
      }
    }

    // Set "maxDate"
    if (this.options.maxDate instanceof Date) {
      if (this.options.minDate instanceof Date) {
        if (moment(this.options.model.get('finish')).isAfter(this.options.maxDate)
          || moment(this.options.model.get('finish')).isBefore(this.options.minDate)) {
          this.options.model.set('finish', moment(this.options.maxDate));
        }
      } else {
        if (moment(this.options.model.get('finish')).isAfter(this.options.maxDate)) {
          this.options.model.set('finish', moment(this.options.maxDate));
        }
      }
    }
  },

  /**
   * Put the values object ctx (dates) inside the different inputs (datepickers)
   */
  _setValuesInDatePickers: function () {
    // Check if the date is inside the "min" and "max"
    var dateStart = this.options.minDate === null 
      || moment(this.options.minDate).isBefore(this.options.model.get('start'))
        ? this.options.model.get('start').toDate()
        : this.options.minDate;
    var dateFinish = this.options.maxDate === null
      || moment(this.options.maxDate).isAfter(this.options.model.get('finish'))
        ? this.options.model.get('finish').toDate()
        : this.options.maxDate;

    try {
      this.$('.date.start').datepicker('setDate', dateStart);
      this.$('.date.finish').datepicker('setDate', dateFinish);
    } catch (err) {
      this.$('.date.start').val('--').datepicker();
      this.$('.date.finish').val('--').datepicker();
    }
  },

  /**
   * In triggered in the event "beforeShow" from the datepicker
   * 
   * Set varios options inside the different "datepicker" instances
   * 
   * @param {Object} input - datepicker input
   * @param {Object} inst - datepicker instance
   */
  _placeDatePicker: function (input, inst) {
    if (input.classList.contains('start')) {
      // Check the "min" and "max" date
      var lastDate = this.options.maxDate === null
        || moment(this.options.maxDate).isBefore(this.$('.date.finish').datepicker('getDate'))
          ? moment(this.$('.date.finish').datepicker('getDate')).startOf('day')
          : moment(this.options.maxDate).startOf('day');
      var lastDateMinusRange = lastDate.clone().subtract(this.options.maxRange);
      var firstDate = this.options.minDate === null
        || moment(this.options.minDate).isBefore(lastDateMinusRange)
          ? lastDateMinusRange
          : moment(this.options.minDate);

      inst.settings.minDate = firstDate.toDate();
      inst.settings.maxDate = lastDate.toDate();
    } else if (input.classList.contains('finish')) {
      var firstDate = this.options.minDate === null
        || moment(this.options.minDate).isAfter(moment(this.$('.date.start').datepicker('getDate')))
          ? moment(this.$('.date.start').datepicker('getDate')).startOf('day')
          : moment(this.options.minDate).startOf('day');
      var firstDateAddRange = firstDate.clone().add(this.options.maxRange);
      var lastDate = this.options.maxDate === null
        || moment(this.options.maxDate).isAfter(firstDateAddRange)
          ? firstDateAddRange
          : moment(this.options.maxDate);

      inst.settings.minDate = firstDate.toDate();
      inst.settings.maxDate = lastDate.toDate();
    } else {
      return -1;
    }
    this.$el.append(inst.dpDiv);
  },

  _datepickerPosition: function (e) {
    this.$el.removeClass('range_open');
    $('#ui-datepicker-div').css({ 'left': this.$el.css('left') });
    $(e.currentTarget).closest('.date_wrapper').addClass('active');
    this.$('.header').addClass('picker_open');

    this.$el.addClass('all_height')
  },

  _close_datepicker: function () {
    $('#ui-datepicker-div').css({ 'display': 'none' });
    this.$('.picker_open').removeClass('picker_open');
    this.$('.date_wrapper').removeClass('active');
    this.$('.date').datepicker('hide');

    this.$('.date.start').blur();
    this.$('.date.finish').blur();

    this.$el.removeClass('all_height')
  },

  _toggleRangeValues: function (e) {
    this._close_datepicker()
    this.$el.toggleClass('range_open');
  },

  /**
   * Event triggered when the user change (click)
   * the date range (Today, last month...)
   */
  _rangeSelected: function (e) {
    e.stopPropagation();
    this.$el.removeClass('range_open');

    var finish = moment().endOf('day');
    var $e = $(e.currentTarget);
    var unit = $e.attr('data-unit');
    var value = parseInt($e.attr('data-value'));
    var start = unit !== 'origin'
      ? moment().subtract(value, unit).startOf('day')
      : moment(0).startOf('day');

    this.options.model.set({
      start: start.utc(),
      finish: finish.utc()
    });

    this._addCompact();
  },

  /**
   * Event triggered when the user change the date
   * or select (click) other date from datepicker
   */
  _dateChange: function () {
    var currentStartDatePicker = moment(this.$('.date.start').datepicker('getDate'));
    var currentFinishDatePicker = moment(this.$('.date.finish').datepicker('getDate'));
    // Check if the date is inside the "min" and "max"
    var start = this.options.minDate === null
      || moment(currentStartDatePicker).isAfter(this.options.minDate)
        ? currentStartDatePicker
        : moment(this.options.minDate);
    var finish = this.options.maxDate === null
      || moment(currentFinishDatePicker).isBefore(this.options.maxDate)
        ? currentFinishDatePicker
        : moment(this.options.maxDate);

    // Set current (valid) Date
    this.$('.date.start').datepicker('setDate', start.toDate());
    this.$('.date.finish').datepicker('setDate', finish.toDate());

    var diffTime = finish.diff(start, 'days');

    if (diffTime <= this.options.maxRange.asDays()) {
      this.options.model.set('start', start.utc());
      this.options.model.set('finish', finish.utc());
    } else {
      this.options.model.set('start', start.utc());
      this.options.model.set('finish', start.clone().add(this.options.maxRange).utc());
    }
  },

  /**
   * Close datepicker dialog
   */
  _removeCompact: function () {
    this.$el.removeClass('compact');
  },

  /**
   * Enabled/Disabled Date
   * 
   * @param {Boolean} enabled - activa o desactiva las fechas
   */
  _enabledDate: function () {
    this.$el.toggleClass('disabled', this.options.model.getMapTooltipIsShow());
  },

  /**
   * Open datepicker dialog
   */
  _addCompact: function () {
    if (this.options.compact) {
      this.$el.addClass('compact');
      this.$el.removeClass('range_open');
    }
  },

  /**
   * Set options to datepicker
   * 
   * @param {String} key - option key
   * @param {String | Object | Number} value - value key
   */
  _setOptions: function (key, value) {
    this.options[key] = value;
    this.trigger('change:' + key);
  },
  
  /**
   * Triggered when the View is remove from DOM
   */
  onClose: function () {
    this.stopListening();
  }

});
