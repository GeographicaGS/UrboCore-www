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


App.View.Widgets.MultipleVariable = Backbone.View.extend({

  _template: _.template( $('#widgets-widget_multiple_variable_template').html()),

  initialize: function(options) {
    this.options = options;
    // this.onclick = options.onclick;
    this.variables = options.variables;
  },


  render:function() {
    var _this = this;
    _this.$el.addClass('multipleVariableWidget');
    this.collection.fetch({
      data: this.options.searchParams,
      success: function(response) {
        let model = response.toJSON();

        if (_.isArray(model)) {
          model = model[0];
        }
        
        _this.$el.html(_this._template({model: model, variables: _this.variables, options: _this.options}));    
      }
    });
    
    return this;
  }


});
