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

App.View.Panels.Frames.Data = App.View.Panels.Map.extend({
  _templateFrame: _.template('<iframe width="100%" height="100%" frameborder="0" src="<%= url %>" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>'),

  initialize: function(options) {
    var options = _.defaults(options, {
      id_category: 'frames',
      spatialFilter: false,
      master: false,
      title: __('Índice'),
      id_panel: 'master',
      filterView: false,
      dateView: false,
      type: 'cityanalytics',
    });
    App.View.Panels.Map.prototype.initialize.call(this,options);

    this.framesCol = new App.Collection.Frames.ScopeFrames([], {
      scope: this.scopeModel.id, 
    });
    this.listenTo(this.framesCol, 'reset', this.renderNavBar);
    this.framesCol.fetch({data:{
      vertical: options.vertical,
      type: options.type,
    },reset: true});
  },

  renderNavBar: function() {
    var _this = this;
    this.framesCol.each(function (elem, idx) {
      _this.panelList.add({
        id: elem.id,
        title: elem.get('title'),
        url: '/' + _this.scopeModel.get('id') + '/' + _this.id_category + '/' + elem.id
      });
    });
    this.id_panel = this.frameId;
    this.render();

    this.frameModel = new App.Model.Frame({id: this.frameId, scope: this.scopeModel.id});
    this.frameModel.fetch({ success: this.renderIframe.bind(this) });
  },

  renderIframe: function(){
    this.$el.html(this._templateFrame(this.frameModel.toJSON()));
  }

});
