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

/*
*     - template (String, optional) HTML template for the widget
*     - tooltipTemplate (String, optional) HTML template for the tooltip
*     - legendTemplate (String, optional) HTML template for the legend
*     - legendNameFunc (Function, optional) Forces a legend name. Parameter: key
*     - legendOrderFunc (Function, optional) Forces a legend keys order. Parameter: key
*     - showAggSelector (Boolean, optional) Show aggregation selectors on the legend if available. Default: false
*     - hideLegend (Boolean, optional) Default: false
*     - tooltipFunc: (Function, optional) Parses the needed info to show in a tooltip
*     - hideTooltip (Boolean, optional) Default: false
*     - xAxisFunction (JS Function, optional) Function to format X axis values
*     - yAxisFunction (JS Function, optional) Function to format Y axis values
      - yAxisStep (Number, optional) Forces the number for range on Y axis calculation, without preventing domain changes
*     - xAxisLabel (String, optional) Label for X axis
*     - yAxisLabel (String, optional) Label for Y axis
*     - yAxisAdjust (Boolean, optional) Forces Y axis to adjust to domain
*     - colors (Array with strings within, optional) Set of colours for each legend element
*     - maxColors (Integer, optional),
*     - noDataMessage (String, optional) Sets a custom message to show when there is no data to draw
*     - currentStep (Model, optional) Enable steps control and sets the current Step. This model needs a 'step' attribute.
*     - hideStepControl (Boolean, optional) Force disable steps control
*     - disabledList (Array with keys, optional) Hide in the beginning some keys
*/
App.Model.BaseChartConfigModel = Backbone.Model.extend({
  defaults: {
    template: false,
    tooltipTemplate: false,
    legendTemplate: false,
    legendNameFunc: false,
    showAggSelector: false,
    hideLegend: false,
    tooltipFunc: false,
    hideTooltip: false,
    xAxisFunction: false,
    yAxisFunction: false,
    xAxisLabel: false,
    yAxisStep:null,
    yAxisLabel: false,
    yAxisAdjust: false,
    colors: d3.scale.category20().range(),
    groupSpacing: 0.1,
    // maxColors: 3,
    noDataMessage: __('No hay datos disponibles'),
    hideStepControl: false,
    disabledList: []
  }
});
