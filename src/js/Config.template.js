//
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
//
var App = App || {};

var baseURL = 'URL_FOR_API';

App.config = {
  'api_url': 'http://' + baseURL,
  'ws_url': 'ws://' + baseURL + '/',
  'map_position': [36.7196718, 4.4167761],
  'layout': 'basetheme',
  'layout_header': false, // Used to override the header template - Example: 'custom_header_template'
  'layout_footer': false, // Used to override the footer template - Example: 'custom_footer_template'
  'map_zoom': 17,
  'maps_prefix': 'dev_'
};
