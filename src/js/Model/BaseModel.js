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

App.Model.Base = Backbone.Model.extend({
  initialize: function (options) {
    options = options || {};
    // To fix the problem with "type" param (now or historic) in the models (MapsModels)
    if (options.type
      && options.type.toLowerCase() !== 'get'
      && options.type.toLowerCase() !== 'post'
      && options.type.toLowerCase() !== 'put'
      && options.type.toLowerCase() !== 'delete') {
      options.typeInUrl = options.type;
      delete options.type;
    }

    this.options = options;
  },

  fetch: function (options) {
    options = _.defaults(options, {
      contentType: 'application/json'
    });

    return Backbone.Model.prototype.fetch.call(this, options);
  }
});

App.Model.Post = App.Model.Base.extend({
  fetch: function (options) {
    options = _.defaults(options, {
      type: 'POST'
    });

    // Add initial model options
    options = _.extend(this.options || {}, options);

    if (options.data) {
      if (typeof options.data !== 'string') {
        options.data = JSON.stringify(options.data);
      }
    }

    return App.Model.Base.prototype.fetch.call(this, options);
  }
});


App.Model.Put = App.Model.Base.extend({
  url: function () {
    return this.options.url;
  },
  fetch: function (options) {
    options = _.defaults(options, {
      type: 'PUT'
    });

    // Add initial model options
    options = _.extend(this.options || {}, options);

    if (options.data) {
      options.data = JSON.stringify(options.data);
    }

    return App.Model.Base.prototype.fetch.call(this, options);
  }
});

App.Model.Widgets.Base = Backbone.Model.extend({
  defaults: {
    link: null,
    timeMode: null,
    infoTemplate: null,
    // Probably category will be deprectaed
    category: null,
    title: null,
    // refreshTime in seconds. If timeMode='now' and refreshTime=null refreshTime will be set to 30s
    refreshTime: 60 * 1000,
  }
});

App.Model.PublishedWidget = App.Model.Post.extend({
  defaults: {
    b: '',
    name: '',
    description: null,
    widget: '',
    scope: '',
    payload: []
  },
  url: function () {
    return App.config.api_url + '/' + App.currentScope + '/auth/widget/';
  }
});


App.Model.TilesModel = Backbone.Model.extend({

  initialize: function (options) {
    this.url = options.url;
    this.params = options.params;
  },

  fetch: function () {
    var _this = this;
    var mapConfig = encodeURIComponent(JSON.stringify(this.params));
    $.get(this.url + '?config=' + mapConfig, function (o) {
      _this.set('response', o);
    });
  }
});

App.Model.FunctionModel = Backbone.Model.extend({

  initialize: function (options) {
    this.function = options.function;
    this.params = options.params;
  },

  fetch: function (opts) {
    if (opts.data && opts.data.params) {
      this.params = opts.data.params
    }
    var result = this.function.apply(this, this.params);
    this.set('response', result);
  }
});

App.Model.MapsModel = App.Model.Post.extend({
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
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});

/**
 * Model to get the GEOJSON from CartoDB
 * 
 * We use the API --> https://carto.com/developers/sql-api/reference/
 */
App.Model.CartoSqlApiV2Model = Backbone.Model.extend({

  /**
   * The "custom" options to this model are:
   * -cartoAccount: the carto account saved in metadata to build the URL
   * -format: the format that the data will be returned
   *  ("GPKG","CSV", "SHP", "SVG", "KML", "SpatiaLite", "GeoJSON")
   * -q: query to launch in Carto
   * -userUrl: custom URL provided by the user
   * 
   * @param {Object} options different options to Model
   */
  initialize: function (options) {
    this.options = _.defaults(options || {}, {
      cartoAccount: null,
      format: 'GeoJSON',
      q: null,
      userUrl: null
    });
  },

  /**
   * return the URL to use in the request
   * 
   * @return {String} - url customized
   */
  url: function () {
    var cartoAccount = this.options.cartoAccount
      ? App.Utils.getCartoAccount(this.options.cartoAccount)
      : false;

    if (this.options.userUrl) {
      return this.options.userUrl
    } else if (cartoAccount) {
      return 'https://' + cartoAccount + '.carto.com/api/v2/sql'
    } else {
      return false;
    }
  },

  /**
   * Customizable "fetch" function to model
   */
  fetch: function (options) {
    var params = _.extend({}, {
      format: this.options.format,
      q: this.options.q
    }, options || {});
    var currentUrl = this.url() || false;

    if (params.q && currentUrl) {
      $.post(currentUrl, params)
        .done(function (response) {
          this.set('response', response);
        }.bind(this));
    }
  }
});