
App.View.Widgets.Variable = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_variable_template').html()),

  initialize: function(options) {
    this.options = options;
  },

  render:function() {
    var _this = this;
    this.model.fetch({
      data: this.model.options.data,
      success: function(m, data){
        var d = m.toJSON();
        d.value = data.value[_this.options.agg.toUpperCase()];
        d.max = _this.options.max || data.value['MAX'];
        d.min = _this.options.min || data.value['MIN'];
        if (_this.options.refValue)
          d.refPerc = 100 * (d.value/_this.options.refValue -1);
        else
          d.refPerc = null;
        _this.$el.html(_this._template(d));
      }
    });
    return this;
  }


});
