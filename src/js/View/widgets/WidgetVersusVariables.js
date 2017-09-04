'use strict';

App.View.Widgets.VersusVariables = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_versus_template').html() ),

  initialize: function(options) {
    this._collection = options.collection;
    this._precedence = options.precedence;

  },

  render:function(){
    var _this = this;
    this._collection.fetch({
      data: {},
      success:function(data){

        var primary = data.toJSON().filter(function(d){ return d.name==_this._precedence[0] })[0] || {};
        var secondary = data.toJSON().filter(function(d){ return d.name==_this._precedence[1] })[0] || {};

        _this.$el.html(_this._template({
          primary: {
            class: 'outOfService',
            label: __('Est. fuera de servicio'),
            value: primary.value || '--'
          },
          secondary: {
            class: 'withIncidence',
            label: __('Con alguna incidencia'),
            value: secondary.value || '--'
          }

        }));
      }
    });

    return this;
  }

});
