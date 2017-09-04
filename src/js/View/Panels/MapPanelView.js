'use strict';

App.View.Panels.Map = App.View.Panels.Base.extend({
  _template: _.template( $('#dashboard_map_template').html() ),
  className: 'fill_height flex',
});
