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
  }
});

App.Collection.Post = App.Collection.Base.extend({
  fetch: function (options) {
    options = _.defaults(options, {
      type: 'POST',
      contentType: 'application/json',
    });

    options.data = JSON.stringify(
      _.defaults(options.data || {}, this.options && this.options.data ? this.options.data : {})
    );

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
    options = _.extend(options, {
      data: {
        filters: {
          conditions: {},
          condition: {}
        }
      }
    });
    return App.Collection.Post.prototype.fetch.call(this, options);
  }
});
