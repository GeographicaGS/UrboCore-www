'use strict';
App.View.Map.MapboxLegendView = Backbone.View.extend({
  _legend: `
    <div class="mapbox-legend">
      ##ITEMS##
    </div>
  `,
  _item: `
    <div class="mapbox-legend-item">
      <span>##ITEM_NAME##</span>
      ##CHILDS##
    </div>
  `,
  _child: `
    <div class="mapbox-legend-item-child">
      <span>##ITEM_CHILD##</span>
    </div>
  `,

  initialize: function(map, items) {
    this._mapInstance = map;
    this.items = [{
      name: 'Tipo de consumo',
      childs: [{
        name: 'Doméstico',
      }, {
        name: 'Industrial',
      }]
    }, {
      name:'Sensores'
    }];
  },

  render: function() {
    let items = '';
    let legend = '';

    this.items.forEach(function(item){
      items += this._item.replace(/##ITEM_NAME##/, item.name);
    }.bind(this));

    legend = this._legend.replace(/##ITEMS##/, items);
    this.$el.append(legend);
    return this;
  }

});