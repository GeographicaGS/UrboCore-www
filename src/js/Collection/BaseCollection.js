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
  initialize: function(models,options){
    this.options = options;
  }
});

App.Collection.Post = App.Collection.Base.extend({
  fetch: function(options) {
    options.type='POST';
    options.contentType='application/json';

    // TODO: Fix Timeserie doesn't refresh BBox
    // var params = options.data || this.options.data;
    // if(typeof params.filters == "undefined"){ params.data.filters = {}; }
    //
    // if(App.ctx.get('bbox_status') && App.ctx.get('bbox')){
    //   params.filters.bbox = App.ctx.get('bbox');
    // }
    // options.data=JSON.stringify(params);

    options.data = JSON.stringify(_.defaults(options.data, this.options.data));
    // options.data = JSON.stringify(options.data || this.options.data);

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});


App.Collection.PublishedWidget = App.Collection.Base.extend({
  model: App.Model.PublishedWidget
});
