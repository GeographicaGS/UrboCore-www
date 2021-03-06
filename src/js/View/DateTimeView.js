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

$.datepicker.regional['es'] =
    {
        "monthNames": [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre"
        ],

        "dayNames": [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado"
        ],
        "dayNamesShort": [
          "D",
          "L",
          "M",
          "X",
          "J",
          "V",
          "S"
        ],
        "dayNamesMin": [
          "D",
          "L",
          "M",
          "X",
          "J",
          "V",
          "S"
        ],
      };

$.datepicker.setDefaults($.datepicker.regional['es']);
$.timepicker.regional['es'] = {
  timeOnlyTitle: 'Elegir una hora',
  timeText: 'Hora',
  hourText: 'Horas',
  minuteText: 'Minutos',
  secondText: 'Segundos',
  millisecText: 'Milisegundos',
  microsecText: 'Microsegundos',
  timezoneText: 'Uso horario',
  currentText: 'Hoy',
  closeText: 'Cerrar',
  timeFormat: 'HH:mm',
  timeSuffix: '',
  amNames: ['a.m.', 'AM', 'A'],
  pmNames: ['p.m.', 'PM', 'P'],
  isRTL: false
};
$.timepicker.setDefaults($.timepicker.regional['es']);


App.View.DateTime = Backbone.View.extend({
  _template: _.template( $('#datetime_template').html() ),

  initialize: function(options) {
    var options = options || {};
    this._compact = options.compact ? options.compact : null;
    this.maxRange = options.maxRange ? options.maxRange : moment.duration(1, 'year');
    _.bindAll(this, '_placeDatePicker');
  },

  events: {
    'mouseup .date' : '_datepickerPosition',
    'click .range_values li': '_rangeSelected',
    'change .date.start, .date.finish': '_dateChange',
    'mouseover': '_removeCompact',
    'mouseleave': '_addCompact'
  },

  onClose: function () {
    this.stopListening();
  },

  render: function () {
    var _this = this;
    var isHighRangeCtx = false;
    var isCrazyRangeCtx = false;
    if (this.maxRange.asDays() >= 365 && this.maxRange.asDays < 36500) {
      isHighRangeCtx = true;
    } else if(this.maxRange.asDays() >= 36500) {
      isHighRangeCtx = true;
      isCrazyRangeCtx = true;
    }
    this.setElement(this._template({ isHighRangeCtx: isHighRangeCtx, isCrazyRangeCtx: isCrazyRangeCtx }));
    this.$('.date').datetimepicker({ dateFormat: 'dd/mm/yy',
      minDate: moment().toDate(),
      beforeShow: this._placeDatePicker,
      onClose: function () {
        _this._close_datepicker();
      }
    });

    this._renderDatePicker();

    if (this._compact)
      this.$el.addClass('compact');

    return this;
  },

  _renderDatePicker: function () {
    this.$('.date.start').datepicker('setDate', moment().toDate());
    this.$('.date.finish').datepicker('setDate', moment().add(1,'hour').toDate());
  },

  _placeDatePicker: function(input, inst){
    if(input.classList.contains('start')){
      inst.settings.minDate = moment().toDate();
    }else if (input.classList.contains('finish')){
      var firstDate = moment(this.$('.date.start').datepicker('getDate'));
      inst.settings.minDate = firstDate.toDate();
    }else{
      return -1;
    }
    this.$el.append(inst.dpDiv);
  },

  _datepickerPosition:function(e){
    this.$el.removeClass('range_open');
    $('#ui-datepicker-div').css({'left':this.$el.css('left')});
    $(e.currentTarget).closest('.date_wrapper').addClass('active');
    this.$('.header').addClass('picker_open');

    this.$el.addClass('all_height')
  },

  _close_datepicker:function(){
    $('#ui-datepicker-div').css({'display':'none'});
    this.$('.picker_open').removeClass('picker_open');
    this.$('.date_wrapper').removeClass('active');
    this.$('.date').datepicker('hide');

    this.$('.date.start').blur();
    this.$('.date.finish').blur();

    this.$el.removeClass('all_height')
  },

  _toggleRangeValues:function(e){
    this._close_datepicker()
    this.$el.toggleClass('range_open');
  },

  _rangeSelected:function(e){
    e.stopPropagation();
    this.$el.removeClass('range_open');

    var finish = moment().endOf('day');
    
    var start;
    var $e = $(e.currentTarget),
      unit = $e.attr('data-unit'),
      value = parseInt($e.attr('data-value'));
    
    if (unit !== 'origin') {
      start = moment().subtract(value,unit).startOf('day')
    } else {
      start = moment(0).startOf('day');
    }

    this._addCompact();
  },

  _dateChange:function(){
  },

  _removeCompact:function(){
    this.$el.removeClass('compact');
  },

  _addCompact:function(){
    if(this._compact){
      this.$el.addClass('compact');
      this.$el.removeClass('range_open');
    }
  },

  _readValues: function() {
    return {
      start: moment(this.$('.date.start').datepicker('getDate')),
      finish: moment(this.$('.date.finish').datepicker('getDate')),
    }
  }

});
