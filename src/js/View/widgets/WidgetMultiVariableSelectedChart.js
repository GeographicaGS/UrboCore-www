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

App.View.Widgets.MultiVariableSelectedChart = App.View.Widgets.MultiVariableChart.extend({

  // Templates
  viewTemplate: _.template($('#widgets-widget_multiVariable_selected_chart').html()),

  initialize: function (options) {
    // Set params new options
    options = _.defaults(options || {}, {
      selectedVariable: null,
      selectableVariables: [],
    });

    // Set permissions over differents variables of entity
    options.selectableVariables = _.filter(options.selectableVariables, function (variable) {
      return App.mv().validateInMetadata({ variables: [variable.id] });
    });

    // set others parameters
    if (options.multiVariableModel) {
      options.multiVariableModel
        .set('selectableVariables', options.selectableVariables || []);
      options.multiVariableModel
        .set('selectedVariable', options.selectedVariable || null);
    }

    App.View.Widgets.MultiVariableChart.prototype.initialize.call(this, options);

    _.bindAll(this, 'onChangeVariable');
  },

  events: _.extend({
    'click .popup_widget.variableSelector .varsel li': 'onChangeVariable'
  }, App.View.Widgets.MultiVariableChart.prototype.events),

  /**
   * When change the value of selector (title)
   *
   * @param {Object} e - triggered event
   */
  onChangeVariable: function (e) {
    var selectedVariable = $(e.currentTarget);
    var selectedVariableId = selectedVariable.data('varid');

    // Set variable selected
    this.mvModel.selectedVariable = selectedVariableId;
    this.options.selectedVariable = selectedVariableId;

    // Set options model
    _.extend(this.mvModel, this.getMultivariableModel().toJSON());

    // set changes in DOM
    this.$('.popup_widget.variableSelector > span').html(selectedVariable.html());
    this.$('.popup_widget.variableSelector .selected').removeClass('selected');
    selectedVariable.addClass('selected');

    // this._drawContent();
    this.collection.fetch();
  },

});
