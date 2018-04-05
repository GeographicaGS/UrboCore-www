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

App.View.Widgets.VariableSimple = Backbone.View.extend({
  
    _template: _.template( $('#widgets-widget_variablesimple_template').html()),
  
    initialize: function(options) {
      this.options = options;
      this.listenTo(this.collection,"reset",this.render);      
    },
  
    render:function() {
      var _this = this;
      var model = this.model.options.data;
      model.start = App.ctx.getDateRange().start;
      model.finish = App.ctx.getDateRange().finish;
      this.model.fetch({
        data: model,
        success: function(m){
          var d = m.toJSON();
          _this.$el.html(_this._template(d));
        }
      });
      return this;
    }
  });
