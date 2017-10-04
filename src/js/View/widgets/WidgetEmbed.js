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

App.View.Widgets.Embed = App.View.Container.extend({

  initialize: function(options){
    _.bindAll(this,'_fetchedMetadata');

    options = _.defaults(options,{
      embed: true
    });
    App.View.Container.prototype.initialize.call(this,options);

    var classname = options.classname,
      namespace = classname.split('.').slice(1),
      obj = App;

    for (var i in namespace)
      obj = obj[namespace[i]];

    this.options = options;
    this._class = obj;

  },

  _fetchedMetadata: function(){
    this.subviews[0] = new this._class(this.options);
    this.$el.html(this.subviews[0].render().el);

  },

  render: function(){
    this._fetchedMetadata();
    return this;
  }

});
