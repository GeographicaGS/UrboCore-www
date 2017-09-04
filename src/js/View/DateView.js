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
      }
    ;
    $.datepicker.setDefaults($.datepicker.regional['es']);


App.View.Date = Backbone.View.extend({
  _template: _.template( $('#date_template').html() ),

  initialize: function(options) {
    var options = options || {};
    this._compact = options.compact ? options.compact : null;
    this.model = options.model ? options.model : App.ctx;
    this.maxRange = options.maxRange ? options.maxRange : moment.duration(1, 'months');
    this.listenTo(this.model,'change:start change:finish',this._renderDatePicker);
    _.bindAll(this, '_placeDatePicker');
  },

  events: {
    'mouseup .date' : '_datepickerPosition',
    'click .range_selector': '_toggleRangeValues',
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
    if (this.maxRange.asDays() >= 365) {
      isHighRangeCtx = true;
    }
    this.setElement(this._template({ isHighRangeCtx: isHighRangeCtx }));
    this.$('.date').datepicker({ dateFormat: 'dd/mm/yy',
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
    try {
      this.$('.date.start').datepicker('setDate', this.model.get('start').toDate());
      this.$('.date.finish').datepicker('setDate', this.model.get('finish').toDate());
    } catch (err) {
      this.$('.date.start').val('--').datepicker();
      this.$('.date.finish').val('--').datepicker();
    }
  },

  _placeDatePicker: function(input, inst){
    if(input.classList.contains('start')){
      var lastDate = moment(this.$('.date.finish').datepicker('getDate')).startOf('day');
      var firstDate = lastDate.clone().subtract(this.maxRange);
      inst.settings.minDate = firstDate.toDate();
      inst.settings.maxDate = lastDate.toDate();
    }else if (input.classList.contains('finish')){
      var firstDate = moment(this.$('.date.start').datepicker('getDate')).startOf('day');
      var lastDate = firstDate.clone().add(this.maxRange);
      inst.settings.minDate = firstDate.toDate();
      inst.settings.maxDate = lastDate.toDate();
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

    var $e = $(e.currentTarget),
      unit = $e.attr('data-unit'),
      value = parseInt($e.attr('data-value')),
      start = moment().subtract(value,unit).startOf('day');
    this.model.set({
      start: start.utc(),
      finish:finish.utc()
    });

    this._addCompact();
  },

  _dateChange:function(){
    var start = moment(this.$('.date.start').datepicker('getDate')).startOf('day'),
      finish = moment(this.$('.date.finish').datepicker('getDate')).endOf('day');
    var diffTime = finish.diff(start, 'days');
    if(diffTime <= this.maxRange.asDays()){
      this.model.set('start',start.utc());
      this.model.set('finish',finish.utc());
    }else{
      this.model.set('start',start.utc());
      this.model.set('finish',start.clone().add(this.maxRange).utc());
    }
  },

  _removeCompact:function(){
    this.$el.removeClass('compact');
  },

  _addCompact:function(){
    if(this._compact){
      this.$el.addClass('compact');
      this.$el.removeClass('range_open');
    }
  }

});
