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
*     - xAxisLabel (String, optional) Label for X axis
*     - yAxisLabel (String, optional) Label for Y axis
*     - yAxisAdjust (Boolean, optional) Forces Y axis to adjust to domain
*     - colors (Array with strings within, optional) Set of colours for each legend element
*     - maxColors (Integer, optional),
*     - noDataMessage (String, optional) Sets a custom message to show when there is no data to draw
*     - currentStep (Model, optional) Enable steps control and sets the current Step. This model needs a 'step' attribute.
*     - hideStepControl (Boolean, optional) Force disable steps control
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
    yAxisLabel: false,
    yAxisAdjust: false,
    colors: d3.scale.category20().range(),
    // maxColors: 3,
    noDataMessage: __('No hay datos disponibles'),
    hideStepControl: false
  }
});
