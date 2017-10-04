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

App.Collection.Deprecated.WidgetContext = Backbone.Collection.extend({

	url: App.config.api_url + '/',

	initialize: function(models,options) {
    Backbone.Collection.prototype.initialize.call(this,[models,options])
		if (options.url) this.url = options.url;
    this.options = options;
		this.options.data = this.options.data || {};
		this.listenTo(App.ctx, 'change:start change:finish change:bbox', this.fetch);
  },

  parse: function(response){
    return _.map(response, function(r){
      r.date_created = r.date_open || r.date_status;
      return r;
    });
  },

  fetch: function(params) {
		var options = {
			reset: true,
			data: this.options.data
		};
		_.extend(options, params);

		var date = App.ctx.getDateRange();
		options.data.start = date.start;
		options.data.finish = date.finish;
		if(this.options.format)
			options['data']['format'] = this.options.format

		if(App.ctx.get('bbox'))
			options['data']['bbox'] = App.ctx.get('bbox');

		return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
