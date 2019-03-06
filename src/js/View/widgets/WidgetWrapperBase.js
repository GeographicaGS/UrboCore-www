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
 * widget view to wrap a view that extend from "App.View.Widgets.Base"
 */
App.View.Widgets.WidgetWrapperBase = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options, {
      title: __('Sin título')
    });

    // Call to parent class
    App.View.Widgets.Base.prototype.initialize.call(this, options);

    // Add subview and parent class (App.View.Widgets.Base)
    // put it inside "widget_content"
    if (Array.isArray(options.widgetViewToContent)) {
      _.each(options.widgetViewToContent, function(view) {
        this.subviews.push(view);
      }.bind(this));
    } else {
      this.subviews.push(options.widgetViewToContent);
    }
  }
});
