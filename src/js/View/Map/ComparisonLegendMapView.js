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

App.View.Map.ComparisonLegend = Backbone.View.extend({

  initialize: function(options) {
    this.options = options;
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    var data = [];
    if(this.options.variable.legendData != undefined) {
      var min = this.options.variable.legendData.min;
      var max = this.options.variable.legendData.max;
      data.push({ value: min });
      data.push({ value: max });
    }

    _.each(this.options.rampColor, function(color, index) {
      data.push({name:'color' + index, value:color});
    });

    var choropleth = new cdb.geo.ui.Legend({
       type: "choropleth",
       data: data
     });

    this.$el.html(choropleth.$el);
    return this;
  },
});
