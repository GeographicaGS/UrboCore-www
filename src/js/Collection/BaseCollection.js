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

App.Collection.Base = Backbone.Collection.extend({
  initialize: function (models, options) {
    options = options || {};
    // To fix the problem with "type" param (now or historic) in the collections (MapsCollections)
    if (options.type
      && options.type.toLowerCase() !== 'get'
      && options.type.toLowerCase() !== 'post'
      && options.type.toLowerCase() !== 'put'
      && options.type.toLowerCase() !== 'delete') {
      options.typeInUrl = options.type;
      delete options.type;
    }

    this.options = options;

    // To change the attribute "data" (string), 
    // inside the payload, to JSON object
    this.on('sync', _.bind(function (response) {
      if (response.options && 
        response.options.data && 
        typeof response.options.data === 'string') {
          this.options.data = JSON.parse(response.options.data);
      }
    }, this));
  }
});

App.Collection.Post = App.Collection.Base.extend({
  fetch: function (options) {
    // We transforms the options to JSON to merge with other options
    if (typeof options !== 'undefined' && typeof options.data === 'string') {
      options.data = JSON.parse(options.data);
    }
    // Default values 
    options = _.defaults(options || {}, {
      type: 'POST',
      contentType: 'application/json',
    });
    // Add initial model options
    options = _.extend({}, this.options || {}, options);
    
    // format CSV
    if (options.format === 'csv') {
      options.data.format = 'csv';
      delete options.format;
    }

    // We transform to STRING to send in the requests
    if (typeof options.data !== 'string') {
      options.data = JSON.stringify(options.data);
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});


App.Collection.PublishedWidget = App.Collection.Base.extend({
  model: App.Model.PublishedWidget
});

App.Collection.MapsCollection = App.Collection.Post.extend({
  url: function () {
    return App.config.api_url
      + '/' + this.options.scope
      + '/maps/'
      + this.options.entity
      + '/' + this.options.typeInUrl;
  },

  fetch: function (options) {
    // Default values
    options = _.defaults(options || {}, {
      data: {
        filters: {
          conditions: {},
          condition: {}
        }
      }
    });

    // Add initial model options
    options = _.extend(this.options || {}, options);

    if (options.data) {
      if (typeof options.data !== 'string') {
        options.data = JSON.stringify(options.data);
      }
    }

    return App.Collection.Post.prototype.fetch.call(this, options);
  }
});
