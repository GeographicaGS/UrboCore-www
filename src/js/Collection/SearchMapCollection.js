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

App.Collection.SearchMap = Backbone.Collection.extend({
  initialize: function (models, options) {
    this.options = options;
  },

  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/entities/search'
  },

  fetch: function (options) {
    if (!options)
      options = {}

    options['data'] = { 'entities': this.options.entities, 'term': this.options.term };

    if (this.options.limit)
      options['data']['limit'] = this.options.limit;

    return Backbone.Collection.prototype.fetch.call(this, options);
  }

});

App.Collection.SearchMapExtended = App.Collection.Post.extend({
  url: function () {
    return App.config.api_url
      + '/' + this.options.scope
      + '/entities/search/extended';
  }
})