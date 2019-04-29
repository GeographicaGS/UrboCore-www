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

/**
 * View to show a widget with data about one o two variables with differents options
 */
App.View.Widgets.VariablesData = Backbone.View.extend({

  _template: _.template($('#widgets-widget_variables_data_template').html()),

  initialize: function () {
    
    if (this.model) {
      // Launch the request
      this.model.fetch({
        data: this.model.get('data') || {}
      });

      this.listenTo(this.model, 'change', _.bind(this.render, this));
    }

    if (this.collection) {
      // Launch the request
      this.collection.fetch({ 
        reset: true,
        data: this.collection.options && this.collection.options.data
          ? this.collection.options.data
          : {}
      });

      this.listenTo(this.collection, 'reset', _.bind(this.render, this));
    }
  },

  render: function () {
    this.model
      ? this.$el.html(this._template(this.model.toJSON()))
      : this.$el.html(this._template(this.collection.toJSON()[0]));

    return this;
  }

});
