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

App.View.Filter.Base = Backbone.View.extend({
    className: 'filter compact',

    initialize: function(options){
      options = _.defaults(options, {
      });
      if(options.open)
        this.$el.removeClass('compact');
    }
});

App.View.Filter.MultiSelector = Backbone.View.extend({
  _template: _.template( $('#filter-multiselector_template').html()),

  className: 'multiselector',

  initialize: function(options) {
    this.options = _.defaults(options,{
      show_title: true
    });

    if (this.options.fetchCollection){
      this.collection.fetch({reset: true});
      this.listenTo(this.collection,'reset',this.render);
    }
  },

  events: {
    'click h4' : '_togglePopup',
    'click ul input[type="checkbox"]' : '_filterChange',
    'click ul li' : '_toggleFilter'
  },
  hasPermissions: function(){
    if('options' in this)
      if('permissions' in this.options)
        return App.mv().validateInMetadata(this.options.permissions);
    return true;
  },

  onClose: function(){
      this.stopListening();
  },

  getTitle: function(){
    return this.options.title || '';
  },

  render: function(){

    this.$el.html(this._template({
      title :this.getTitle(),
      show_title: this.options.show_title,
      options: this.collection.toJSON(),
      //current: filters[this.options._id]
    }));

    return this;
  },

  _togglePopup:function(e){
    $(e.currentTarget).toggleClass('active');
    // this.$('h4').not(e.currentTarget).removeClass('active');
  },

  _filterChange:function(e){
    e.stopPropagation();
    var current = $(e.currentTarget);
    var is_checked = $(e.currentTarget).prop('checked');
    var text = '';

    current.closest('h4').find('span').text('');

    if(current.hasClass('all')){
      if(is_checked){
        current.closest('ul').find('input[type="checkbox"]').prop('checked',true);
      }else{
        current.closest('ul').find('input[type="checkbox"]').prop('checked',false);
      }
    }else{
      if(is_checked){
        if(current.closest('ul').find('input[type="checkbox"]:not(:checked):not(.all)').length == 0){
          current.closest('ul').find('.all').prop('checked',true);
        }
      }else{
        current.closest('ul').find('.all').prop('checked',false);
      }
    }

    current.closest('ul').find('li').removeClass('active');
    if(current.closest('ul').find('.all').prop('checked')){
      current.closest('ul').find('.all').closest('li').addClass('active');
      text = current.closest('ul').find('.all').closest('li').text();

    }else{
      var checks = current.closest('ul').find('input[type="checkbox"]');
      _.each(checks,function(c) {
        if($(c).prop('checked')){
          $(c).closest('li').addClass('active');
          text += $(c).closest('li').text() + ', ';
        }
      });
      text = text.slice(0,-2);
    }

    text = text.trim();
    if (!text)
      text = '--';

    current.closest('h4').find('span').text(text);

    var current = '';

    if (!this.$('input.all').prop('checked')){
      current = _.map(this.$('input[data-id]:checked'), function(c){
        return $(c).attr('data-id');
      });
    }

    this.setValue(current);

  },

  setValue: function(value){
    if (!value) value = null;
    this.model.set(this.options.property, value);
  },

  _toggleFilter:function(e){
    e.stopPropagation();
    $(e.currentTarget).find('input[type="checkbox"]').trigger('click');
  }

});

App.View.Filter.RangeSlider = Backbone.View.extend({
  className: 'slider-range',

  initialize: function(options) {
    _.bindAll(this,'_slide','_change');
    this.options = options;
  },

  render: function(){

    var d = this.model.get(this.options.property);

    this.$el.slider({
      range: true,
      min: this.options.domain[0],
      max: this.options.domain[1],
      values: [ d.min, d.max ],
      slide: this._slide,
      change: this._change
    });

    this.$el.append('<span class="min_value">' + d.min + '</span>');
    this.$el.append('<span class="max_value">' + d.max + '</span>');

    this._updateSpanPosition();

    return this;
  },

  _slide: function(e, ui ) {
    this.$('.min_value').text(ui.values[0]);
    this.$('.max_value').text(ui.values[1]);

    this._updateSpanPosition();
  },

  _change: function(e, ui ) {
    var min = parseInt(ui.values[0]),
      max = parseInt(ui.values[1]);

    this.$('.min_value').text(min);
    this.$('.max_value').text(max);

    this._updateSpanPosition();

    this.model.set(this.options.property,{min: min,max: max});
  },

  _updateSpanPosition:function(){
    this.$('.min_value').css({'left':$(this.$('.ui-slider-handle')[0]).css('left')});
    this.$('.max_value').css({'left':$(this.$('.ui-slider-handle')[1]).css('left')});
  }

});
