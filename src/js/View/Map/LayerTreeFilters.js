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

App.View.Map.LayerTree.Filters.Category = App.View.Filter.MultiSelector.extend({


  initialize: function(options) {
    this.options = _.defaults(options,{
      show_title: true,
      fetchCollection: true
    });
     App.View.Filter.MultiSelector.prototype.initialize.call(this,options);
  },

  getTitle: function(){
    return this.options.show_title ?
                 this.options.title ? this.options.title : App.mv().getVariable(this.options.id).get('name')
                 : '';
  },

  setValue: function(value){
    this.model.get('filters')[this.options.id] = value;
    this.model.trigger('change:filters',this.model);
  }
});

App.View.Map.LayerTree.Filters.CategoryFn = function(filters){
  return function(d){
    var values = d.lastdata;
    for (var f in filters){
      if (filters[f]){
        var v = _.find(values,{var: f});
        if (v && filters[f].indexOf(v.value)==-1)
          return false;
      }
    }
    return true;
  }
}

App.View.Map.LayerTree.Filters.RangeSlider = Backbone.View.extend({
  _template: _.template( $('#map-layer_tree_rangefilter_template').html()),

  initialize: function(options) {
    _.bindAll(this,'_slide','_change');
    this._var = App.Utils.toDeepJSON(App.mv().getVariable(options.id_variable));
    this.render();
  },

  render: function(){

    this.$el.html(this._template({'title':this._var.name, 'unit':this._var.units}));

    var min = this._currentMin = parseFloat(this._var.var_thresholds[0]),
        max = this._currentMax = parseFloat(this._var.var_thresholds[this._var.var_thresholds.length-1]);

    this.$( ".slider-range" ).slider({
      range: true,
      min: min,
      max: max,
      values: [ min, max ],
      slide: this._slide,
      change: this._change
    });

    this.$( ".slider-range" ).append('<span class="min_value">' + min + '</span>');
    this.$( ".slider-range" ).append('<span class="max_value">' + max + '</span>');

    return this;
  },

  _slide: function(e, ui ) {
    this.$('.min_value').text(ui.values[0]);
    this.$('.max_value').text(ui.values[1]);

    this.$('.min_value').css({'left':$(this.$('.ui-slider-handle')[0]).css('left')});
    this.$('.max_value').css({'left':$(this.$('.ui-slider-handle')[1]).css('left')});
  },

  _change: function(e, ui ) {
    var min = parseInt(ui.values[0]),
      max = parseInt(ui.values[1]);

    this.$('.min_value').text(min);
    this.$('.max_value').text(max);

    this.$('.min_value').css({'left':$(this.$('.ui-slider-handle')[0]).css('left')});
    this.$('.max_value').css({'left':$(this.$('.ui-slider-handle')[1]).css('left')});

    this.model.get('filters')[this._var.id] = [min,max];
    this.model.trigger('change:filters',this.model);
  }

});

App.View.Map.LayerTree.Filters.RangeFn = function(filters){
  return function(d){
    var values = d.lastdata;
    for (var f in filters){
      if (filters[f]){
        var v = _.find(values,{var: f});
        v.value = parseInt(v.value);
        if (!v || v.value<filters[f][0] || v.value>filters[f][1])
          return false;
      }
    }
    return true;
  }
}

App.View.Map.LayerTree.Filters.IssueItem = App.View.Map.LayerTree.Filters.Category.extend({
  _template: _.template( $('#map-layer_tree_categorylistfilter_template').html()),
  initialize: function(options) {
    this.options = _.defaults(options,{
      show_title: true
    });
  },
  render: function(){
    var filters = this.model.get('filters');
    var title = this.options.id;
    var filter_id = !filters[this.options.id] && this.options.id === 'estados' ? 'estados_full' : this.options.id;
    this.$el.html(this._template({
      title : title == 'categorias' ? 'categorías':title,
      show_title: this.options.show_title,
      options: this.collection.toJSON(),
      current: filters[filter_id]
    }));

    return this;
  },
  _filterChange:function(e){
    e.stopPropagation();
    var current = $(e.currentTarget);
    var icon = $(e.currentTarget).siblings('.icon');
    var is_checked = $(e.currentTarget).prop('checked');
    var text = '';
    var filter_text = current.parent().parent().siblings('h4').find('span');

    filter_text.text('');

    if(icon.length > 0){
      if(is_checked){
        icon.removeClass('disabled').parent().removeClass('disabled');
      }else{
        icon.addClass('disabled').parent().addClass('disabled');
      }
    }

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
      text = '(' + current.closest('ul').find('.all').closest('li').text() + ')';
    }else{
      var checks = current.closest('ul').find('input[type="checkbox"]:checked');
      text = '(' + checks.length + ')';
    }

    filter_text.text(text);

    var activated = _.map(this.$('input[data-id]:checked'), function(c){
      return $(c).attr('data-id');
    });

    // reset filters
    for (var filter in this.model.get('filters')){
      this.model.get('filters')[filter] = null;
    }
    this.model.get('filters')[this.options.id] = activated;

    this.model.trigger('change:filters',this.model);
  },
});

App.View.Map.LayerTree.Filters.ToggleItem = Backbone.View.extend({
  _template: _.template( $('#map-layer_tree_togglefilter_template').html()),

  initialize: function(options) {
    _.bindAll(this,'_change');
    this.filter = options.filter;
    this.render();
  },

  events: {
    'click .toggle a': '_change'
  },

  render: function(){
    this.$el.html(this._template({items: this.collection.toJSON()}));
    return this;
  },

  _change: function(e) {
    e.preventDefault();
    var $item = $(e.currentTarget);
    this.$('.toggle > a.selected').removeClass('selected');
    $item.addClass('selected');
    this.$('p em').html($item.attr('title'));

    this.model.get('filters')[this.filter] = $item.data('filter');
    this.model.trigger('change:filters',this.model);
  }
});

App.View.Map.LayerTree.Filters.ToggleFn = function(filters){
  return function(d){
    var values = d.lastdata;
    for (var f in filters){
      if (filters[f]){
        var v = _.find(values,{var: f});
        if (v && filters[f].indexOf(v.value)==-1)
          return false;
      }
    }
    return true;
  }
}
