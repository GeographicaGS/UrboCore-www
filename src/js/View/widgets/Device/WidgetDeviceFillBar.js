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

App.View.Widgets.Device.FillBar = App.View.Widgets.Base.extend({

  // _template_legend: _.template( $('#dumps-widget_legend_totalvolumestacked_template').html() ),
  // _popup_template: _.template('<div class="popup_stackbar"><div class="element"><span class="value"><%= value %></span><span class="key"><%= key %></span></div></div>'),

  className: 'col-md-4',

  initialize: function(options) {
    options = _.defaults(options,{
      title: '',
      timeMode: 'now',
      data: {value: null}
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    _.bindAll(this,'_tooltipFunc');

    this._chartModel = new Backbone.Model({
      colors:[App.Utils.ARRAY_COLOR[0]],
      xAxisFunction: function(d) {
        return ''
      },
      hideLegend: true,
      formatYAxis:{
        numberOfValues:4,
        tickFormat:function(d) {
          return App.nbf(d) + '%';
        }
      },
      divisorLines: [
        {value: this.options.thresholds[0], color: App.Utils.ARRAY_COLOR[1]},
        {value: this.options.thresholds[1], color: App.Utils.ARRAY_COLOR[2]}
      ],
      percentMode: true,
      tooltipFunc: this._tooltipFunc
    });

    this.subviews.push(new App.View.Widgets.Charts.FillBar({
      opts: this._chartModel,
      data: new Backbone.Model(this.options.data)
    }));
  },

  _tooltipFunc: function(data) {
    var value = this._chartModel.get('formatYAxis').tickFormat(this.options.data.value);
    return App.View.Widgets.Charts.FillBar.prototype._template_tooltip({
      data: {
        key: '',
        series: [
          { value: value, key: this.options.title}
        ]
      },
      utils: {}
    });
  }
});
