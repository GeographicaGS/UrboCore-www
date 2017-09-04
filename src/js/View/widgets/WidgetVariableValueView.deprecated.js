'use strict';

App.View.Widgets.VariableValue = App.View.Widgets.Deprecated.Context.extend({
  _template: _.template( $('#widgets-widget_variable_value_template').html() ),

  initialize: function(options) {

    App.View.Widgets.Deprecated.Context.prototype.initialize.call(this,options);

    this.model = options.model;
    this.listenTo(this.model,"change:agg",function(){
      this.model.fetch();
    });

    this.listenTo(this.model,"change:agg", this.render);
    this.listenTo(this.model,"change:value", this.render);
    this.model.fetch();

    if(options.template){
      this._template = _.template($(options.template).html());
    }
  },

  events: {
    'click .popup_widget li' : '_changeAgg'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({ m: this.model.toJSON() }));
    this.trigger('widget:ready');
    return this;
  },

  _changeAgg:function(e){
    this.model.set('agg',$(e.currentTarget).attr('data-agg'));
  }

});
