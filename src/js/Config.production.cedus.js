var App = App || {};

var baseURL = 'urbo-backend.geographica.gs/api'

App.config = {
  'api_url' : 'https://' + baseURL,
  'ws_url' : 'wss://' + baseURL + '/',
  'map_position':[36.7196718,4.4167761],
  'layout' : 'basetheme',
  'map_zoom':17,
  'with_dema': '7df4e8517dfd672cfca8d8cfba660474',
  'maps_prefix':  'production_'
};
