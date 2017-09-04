'use strict';

App.View.Widgets.CategorizedVariableValue = App.View.Widgets.Deprecated.Context.extend({
  _template: _.template( $('#widgets-widget_categorized_variable_value_template').html() ),

  initialize: function(options) {

    App.View.Widgets.Deprecated.Context.prototype.initialize.call(this,options);

    this._category = options.category || '';
    this._title = options.title || '';
    this._cssClass = options.cssClass || '';
    this._util = {};
    if(options.titleFunc) this._util.titleFunc = options.titleFunc;
    if(options.iconFunc) this._util.iconFunc = options.iconFunc;
    if(options.dataFunc) this._util.dataFunc = options.dataFunc;
    this._unit = options.unit || '';

    this.collection = options.collection;
    // this.listenTo(this.model,"change:agg",function(){
    //   this.model.fetch();
    // });

    this.listenTo(this.collection,"reset", this.render);
    // this.listenTo(this.model,"change:value", this.render);
    this.collection.fetch({reset: true, data: {agg:'avg'}});

    if(options.template){
      this._template = _.template($(options.template).html());
    }

    // TODO: Delete this when API is ready
    this.render();
  },

  events: {
    'click .popup_widget li' : '_changeAgg'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    var model = {
      category: this._category,
      title: this._title,
      cssClass: this._cssClass,
      elements: this.collection.toJSON(),
      unit: this._unit,
      util: this._util
    };
    this.$el.html(this._template(model));
    this.trigger('widget:ready');
    return this;
  },

  _changeAgg:function(e){
    this.model.set('agg',$(e.currentTarget).attr('data-agg'));
  }

});
