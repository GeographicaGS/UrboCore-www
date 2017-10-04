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

App.View.Map.LayerTree.View = Backbone.View.extend({
  _template: _.template( $('#map-layer_tree_template').html()),

  className: 'legend_filter active',

  initialize: function(options) {
    this.options= _.defaults(options,{
      title: __('Filtros'),
      compact: false
    });
    if(this.options.collection.first().get('legendData')){
      _.bindAll(this, 'render');
      this.listenTo(this.options.collection.first().get('legendData'), 'reset', this.render);
      this.options.collection.first().get('legendData').fetch({reset: true});
    }
  },

  events: {
    'click h3' : '_toggle',
    'mouseover': '_open',
    'mouseleave': '_close',
    'click .multiselector h4, .header .title': '_closePopups'
  },

  onClose: function(){
    for (var i in this._itemsView){
      this._itemsView[i].close();
    }
  },

  _toggle: function(){
    if (this.$el.hasClass('active'))
      this.$el.removeClass('active');
    else
      this.$el.addClass('active');

    $('.multiselector h4.active').removeClass('active');

  },

  render: function(){
    this.$el.html(this._template(this.options));
    var $list = this.$('.list_elements');
    this._itemsView = [];

    for (var i=0;i<this.collection.length;i++){
      var m = this.collection.at(i);
      var fn = m.get('itemClass') || App.View.Map.LayerTree.ItemView;
      var opt = $.extend({
        model: m,
        scope: this.options.scope
      }, this.options);
      var v = new fn(opt).render();
      $list.append(v.$el);
      this._itemsView.push(v);
    }
    return this;
  },

  _close:function(){
    if(this._compact){
      this.$el.removeClass('active');
    }
    this.$('.legendPopup').closest('h4.active').removeClass('active');
  },

  _open:function(){
    if(this._compact){
      this.$el.addClass('active');
    }
  },

  _closePopups:function(e){
    // $('.multiselector h4.active').not(e.currentTarget).removeClass('active');
    this.$('.legendPopup').closest('h4.active').not(e.currentTarget).removeClass('active');
  }

});

App.View.Map.LayerTree.ItemView = Backbone.View.extend({
  _template: _.template( $('#map-layer_tree_item_template').html()),

  className: 'element',

  initialize: function(options) {
    this.options = options;
    this._ctx = App.ctx;
    this.listenTo(this.model,'change:enable',this._renderStatus);
    this.listenTo(this.model,'change:totals',this._refreshTotals);
    this.listenTo(this._ctx,'change:bbox_status',this._refreshTotals);
  },

  events: {
    'click span.title': '_toggleLayer'
  },

  _toggleLayer: function(){
    if (!this.model.has('toggle') || this.model.get('toggle'))
      this.model.set('enable',!this.model.get('enable'));
  },

  _renderStatus: function(){
    var $icon = this.$('img.icon');
    if (this.model.get('enable')){
      $icon.attr('src','/img/'+ this.model.get('icon'));
      this.$el.addClass('active');

    }
    else{
      $icon.attr('src','/img/'+ this.model.get('icond'));
      this.$el.removeClass('active');
    }
  },

  _refreshTotals: function(){
    var totals = this.model.get('totals');
    if (!totals) return;

    //var filter = this._ctx.get('bbox_status') ? totals.filter - totals.bbox : totals.filter,
    var filter = totals.filter,
      html = this.model.get('enable') ?
        '<span><span class="current"><strong>' + filter + '</strong> / </span>'+ totals.all+'</span>'
        : '<span>'+ totals.all +'</span>';

    this.$('.count').html(html);
  },

  render: function(){
    var opts = this.model.toJSON();
    opts.legend = this.model.get('legendTemplate') ? _.template($('#' + this.model.get('legendTemplate')).html())(opts) : null;
    this.$el.html(this._template(opts));
    this._renderStatus();
    return this;
  }

});

App.View.Map.LayerTree.SelectorItem = App.View.Map.LayerTree.ItemView.extend({

  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    var dataCollection = this.model.get('dataCollection');
    if(!dataCollection){
      throw new Error('Missing "dataCollection" parameter');
    }
    try{
      this._collection = new dataCollection(null,{scope: options.scope, entity_id: this.model.get('entity_id')});
    }catch (e) {
      this._collection = dataCollection;
    }
  },

  onClose: function(){
    if (this._subview)
      this._subview.close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    // Add filter
    this._subview = new App.View.Map.LayerTree.Filters.Category({id: 'placements', show_title: false, model: this.model, collection: this._collection});
    this.$('.content').append(this._subview.$el);
    return this;
  }
});

App.View.Map.LayerTree.RangeItem = App.View.Map.LayerTree.ItemView.extend({

  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
  },

  onClose: function(){
    for (var i in this._subviews)
      this._subviews[i].close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    this._subviews = [];
    var filters = this.model.get('filters');

    for (var i in filters){
      var v = new App.View.Map.LayerTree.Filters.RangeSlider({ id_variable: i, model: this.model});
      this._subviews.push(v);
      this.$('.content').append(v.$el);
    }
    return this;
  }
});

App.View.Map.LayerTree.CounterItem = App.View.Map.LayerTree.ItemView.extend({
  initialize: function(options){
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this, options);
    this.counterModel = new App.Model.EntitiesCounter({id: this.model.get('entity_id'), scope: this.options.scope, entity: this.options.entity});
    this.listenTo(this.counterModel, 'change', this.refreshCounters);
    this.listenTo(this._ctx,'change:bbox change:start change:finish',this.refreshTotals);
  },

  render: function(){
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    this.refreshTotals();
    return this;
  },

  refreshTotals: function(){
    this.counterModel.fetch();
  },

  refreshCounters: function(){
    var count = this.counterModel.get('all_variables');
    if(count.filter || count.filter === 0){

      this.$('.count').html('<span><span class="current"><strong>' + count.filter + '</strong> / </span>'+ count.total +'</span>');
    }else{
      this.$('.count').html('<span>'+ count.total +'</span>');
    }
  }
});
