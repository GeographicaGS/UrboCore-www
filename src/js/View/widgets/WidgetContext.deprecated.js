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

App.View.Widgets.Deprecated.Context = Backbone.View.extend({

  initialize: function (options) {
    this.model = options.m;
    var _onChangeContext = this._onChangeContext;
    var _view = this;
    if (this.model != undefined) {
      _onChangeContext = this.model.get('onChangeContext');
      var _view = this.model.get('view');
    }

    this.ctxModel = App.ctx;
    _view.listenTo(this.ctxModel, 'change:start change:finish change:bbox', _onChangeContext);
  },

  _onChangeContext: function () {
    if (this.model && this.model.url)
      this.model.fetch();
    if (this.collection)
      this.collection.fetch({ 'reset': true });
  },

  onClose: function () {
    this.stopListening();
  }
});
