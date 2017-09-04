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

App.View.Map.LayerTree.Watering.SolenoidItem = App.View.Map.LayerTree.ItemView.extend({

  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    this._collections = {};
    this._subviews = [];
    var filters = this.model.get('filters');
    for (var i in filters){
        this._collections[i] = new App.Collection.Watering.CatalogSolenoid(null,{scope: options.scope,type: i});
    }
  },

  onClose: function(){
    for (var i in this._subviews)
      this._subviews[i].close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    // Add filters
    this._subviews = [];

    for (var i in this._collections){
      var v = new App.View.Map.LayerTree.Filters.Category({id:i, model: this.model, collection: this._collections[i]});
      this._subviews.push(v);
      this.$('.content').append(v.$el);
    }
    return this;
  }
});

App.View.Map.LayerTree.Watering.PlacementItem = App.View.Map.LayerTree.ItemView.extend({

  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    this._collection = new App.Collection.Watering.Placement(null,{scope: options.scope});
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

// TODO: Create a general view for this
App.View.Map.LayerTree.Waste.IssueItem = App.View.Map.LayerTree.ItemView.extend({
  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    this._collections = {};
    this._subviews = [];
    var filters = this.model.get('filters');
    for (var i in filters){
      if(i == 'categorias'){
        this._collections[i] = App.Static.Collection.Waste.IssueCategories;
      }else if (i == 'estados'){
        this._collections[i] = App.Static.Collection.Waste.IssueStatuses;
      }else if (i == 'estados_full'){
        this._collections['estados'] = App.Static.Collection.Waste.IssueStatusesFull;
      }
    }

    this.counterModel = new App.Model.EntitiesCounter({id: this.model.get('entity_id'), scope: this.options.scope, entity: this.options.entity});
    this.listenTo(this.counterModel, 'change', this._onCounterRefresh);
    this.listenTo(this._ctx,'change:bbox',this._refreshTotals);
    this.stopListening(this._ctx,'change:bbox_status');
  },

  onClose: function(){
    for (var i in this._subviews)
      this._subviews[i].close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    // Add filters
    this._subviews = [];

    for (var i in this._collections){
      var v = new App.View.Map.LayerTree.Filters.IssueItem({id:i, model: this.model, collection: this._collections[i]});
      this._subviews.push(v);
      this.$('.content').append(v.render().$el);
    }

    this.listenTo(this.model, 'change:filters', this._refreshTotals);

    this._refreshTotals();

    return this;
  },

// TODO: Improve filters list generation
  _refreshTotals: function(){
    this.counterModel.fetch({
      params: {
        filters: {
          status: this.model.get('filters')['estados'],
          category: _.map(this._collections.categorias.toJSON(), function(a) {return a.id;})
        }
      }
    });
  },

  _onCounterRefresh: function(e){
    var count_cat = this.counterModel.get('waste.issue.category');
    var count_sta = this.counterModel.get('waste.issue.status');
    var count_total = {total: 0, filter: 0};

    for(var key in count_cat){
      if(count_cat[key].filter || count_cat[key].filter === 0){
        this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_cat[key].filter + '</strong> / </span>'+ count_cat[key].total +'</span>');
      }else{
        this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_cat[key].total +'</span>');
      }
    }

    for(var key in count_sta){
      if(count_sta[key].filter || count_sta[key].filter === 0){
        this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_sta[key].filter + '</strong> / </span>'+ count_sta[key].total +'</span>');
        count_total.filter += count_sta[key].filter;
        count_total.total += count_sta[key].total;
      }else{
        this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_sta[key].total +'</span>');
        count_total.total += count_sta[key].total;
      }
    }

    if(count_total.filter){
      this.$('.title + .count').html('<span><span class="current"><strong>' + count_total.filter + '</strong> / </span>'+ count_total.total +'</span>');
    }else{
      this.$('.title + .count').html('<span>'+ count_total.total +'</span>');
    }
  },
});

// TODO: Create a general view for this
App.View.Map.LayerTree.Waste.MobaItem = App.View.Map.LayerTree.ItemView.extend({
  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    this._collections = {};
    this._subviews = [];
    var filters = this.model.get('filters');
    for (var i in filters){
      if(i == 'tipos'){
        this._collections[i] = App.Static.Collection.Waste.MobaType;
      }
    }

    this.counterModel = new App.Model.EntitiesCounter({id: this.model.get('entity_id'), scope: this.options.scope, entity: this.options.entity});
    this.listenTo(this.counterModel, 'change', this._onCounterRefresh);
    this.listenTo(this._ctx,'change:bbox',this._refreshTotals);
    this.stopListening(this._ctx,'change:bbox_status');
  },

  onClose: function(){
    for (var i in this._subviews)
      this._subviews[i].close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    // Add filters
    this._subviews = [];

    for (var i in this._collections){
      var v = new App.View.Map.LayerTree.Filters.IssueItem({id:i, model: this.model, collection: this._collections[i]});
      this._subviews.push(v);
      this.$('.content').append(v.render().$el);
    }

    this.listenTo(this.model, 'change:filters', this._refreshTotals);

    this._refreshTotals();

    return this;
  },

  // // TODO: Improve filters list generation
  // _refreshTotals: function(){
  //   this.counterModel.fetch({
  //     params: {
  //       filters: {
  //         status: this.model.get('filters')['estados'],
  //         category: _.map(this._collections.tipos.toJSON(), function(a) {return a.id;})
  //       }
  //     }
  //   });
  // },

  // _onCounterRefresh: function(e){
  //   var count_cat = this.counterModel.get('waste.issue.category');
  //   var count_sta = this.counterModel.get('waste.issue.status');
  //   var count_total = {total: 0, filter: 0};
  //
  //   for(var key in count_cat){
  //     if(count_cat[key].filter || count_cat[key].filter === 0){
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_cat[key].filter + '</strong> / </span>'+ count_cat[key].total +'</span>');
  //     }else{
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_cat[key].total +'</span>');
  //     }
  //   }
  //
  //   for(var key in count_sta){
  //     if(count_sta[key].filter || count_sta[key].filter === 0){
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_sta[key].filter + '</strong> / </span>'+ count_sta[key].total +'</span>');
  //       count_total.filter += count_sta[key].filter;
  //       count_total.total += count_sta[key].total;
  //     }else{
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_sta[key].total +'</span>');
  //       count_total.total += count_sta[key].total;
  //     }
  //   }
  //
  //   if(count_total.filter){
  //     this.$('.title + .count').html('<span><span class="current"><strong>' + count_total.filter + '</strong> / </span>'+ count_total.total +'</span>');
  //   }else{
  //     this.$('.title + .count').html('<span>'+ count_total.total +'</span>');
  //   }
  // },
});

// TODO: Create a general view for this
App.View.Map.LayerTree.Waste.VehicleItem = App.View.Map.LayerTree.ItemView.extend({
  initialize: function(options) {
    App.View.Map.LayerTree.ItemView.prototype.initialize.call(this,options);
    this._collections = {};
    this._subviews = [];
    var filters = this.model.get('filters');
    for (var i in filters){
      if(i == 'tipos'){
        this._collections[i] = App.Static.Collection.Waste.VehicleType;
      }
    }

    this.counterModel = new App.Model.EntitiesCounter({id: this.model.get('entity_id'), scope: this.options.scope, entity: this.options.entity});
    this.listenTo(this.counterModel, 'change', this._onCounterRefresh);
    this.listenTo(this._ctx,'change:bbox',this._refreshTotals);
    this.stopListening(this._ctx,'change:bbox_status');
  },

  onClose: function(){
    for (var i in this._subviews)
      this._subviews[i].close();
  },

  render: function(){
    // Call parent constructor
    App.View.Map.LayerTree.ItemView.prototype.render.call(this);
    // Add filters
    this._subviews = [];

    for (var i in this._collections){
      var v = new App.View.Map.LayerTree.Filters.IssueItem({id:i, model: this.model, collection: this._collections[i]});
      this._subviews.push(v);
      this.$('.content').append(v.render().$el);
    }

    this.listenTo(this.model, 'change:filters', this._refreshTotals);

    this._refreshTotals();

    return this;
  },

// TODO: Improve filters list generation
  // _refreshTotals: function(){
  //   this.counterModel.fetch({
  //     params: {
  //       filters: {
  //         status: this.model.get('filters')['estados'],
  //         category: _.map(this._collections.tipos.toJSON(), function(a) {return a.id;})
  //       }
  //     }
  //   });
  // },
  //
  // _onCounterRefresh: function(e){
  //   var count_cat = this.counterModel.get('waste.issue.category');
  //   var count_sta = this.counterModel.get('waste.issue.status');
  //   var count_total = {total: 0, filter: 0};
  //
  //   for(var key in count_cat){
  //     if(count_cat[key].filter || count_cat[key].filter === 0){
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_cat[key].filter + '</strong> / </span>'+ count_cat[key].total +'</span>');
  //     }else{
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_cat[key].total +'</span>');
  //     }
  //   }
  //
  //   for(var key in count_sta){
  //     if(count_sta[key].filter || count_sta[key].filter === 0){
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span><span class="current"><strong>' + count_sta[key].filter + '</strong> / </span>'+ count_sta[key].total +'</span>');
  //       count_total.filter += count_sta[key].filter;
  //       count_total.total += count_sta[key].total;
  //     }else{
  //       this.$('li input[data-id="'+key+'"]').siblings('.count').html('<span>'+ count_sta[key].total +'</span>');
  //       count_total.total += count_sta[key].total;
  //     }
  //   }
  //
  //   if(count_total.filter){
  //     this.$('.title + .count').html('<span><span class="current"><strong>' + count_total.filter + '</strong> / </span>'+ count_total.total +'</span>');
  //   }else{
  //     this.$('.title + .count').html('<span>'+ count_total.total +'</span>');
  //   }
  // },
});
