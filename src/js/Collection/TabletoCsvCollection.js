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
 * Collection to get a CSV file from server
 */
App.Collection.TableToCsv = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.options = _.defaults(options || {}, {
      data_tz: 'Europe/Madrid', //to get the correct date attribute
      dataType: 'text',
      format: 'csv',
    });
  },

  /**
   * To download the CSV generated
   * 
   * @param {Array} response 
   */
  parse: function (response) {
    var blob = new Blob([response], { type: 'text/csv' });
    var csvUrl = window.URL.createObjectURL(blob);
    var link = document.createElement('a');

    link.setAttribute('href', csvUrl);
    link.setAttribute('download', 'download.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

});
