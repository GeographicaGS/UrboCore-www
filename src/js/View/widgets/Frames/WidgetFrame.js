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

App.View.Widgets.Frame.BaseFrame = App.View.Widgets.Base.extend({

  initialize: function (options) {
    var extraMenu = (App.auth && App.auth.getUser() && App.auth.getUser().superadmin)?[
      {
        id: 'editFrame',
        title: __('Editar contenido')
      },
      {
        id: 'deleteFrame',
        title: __('Eliminar frame'),
        class: 'danger'
      }
    ]:null;

    options = _.defaults(options, {
      title: options.frameModel.get('title'),
      bigTitle: true,
      correlationIcon: 'SC_ic_embed_blue.svg',
      timeMode: options.frameModel.get('datatype'),
      refreshTime: 3000000,
      dimension: 'allWidth bgWhite bgWhiteHover allHeight',
      extraMenu: extraMenu,
      classname: 'custom',
    });
    App.View.Widgets.Base.prototype.initialize.call(this, options);
    
    this.$el.addClass('widgetFrame');
    this.subviews.push(new App.View.Widgets.Frame.FrameContent({
      model: options.frameModel
    }));
  },

  events: {
    'click #editFrame': 'editFrame',
    'click #deleteFrame': 'deleteFrame'
  },

  editFrame: function (e) {
    e.preventDefault();

    if(this._popupView == undefined) {
      var popupModel = new Backbone.Model({
        title: __('Editar frame')
      });
      this._popupView = new App.View.PopUp({
        model: popupModel
      });
    }

    var editView = new App.View.Widgets.Frame.FrameEdit({
      model: this.options.frameModel,
      collection: this.options.frameModel.collection
    });
    this._popupView.internalView = editView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(editView, 'close', this._onPopupClose);

    this._popupView.show();

    return false; // To avoid the event to bubble up
  },

  deleteFrame: function (e) {
    e.preventDefault();
    if (window.confirm(__('¿Estás seguro de eliminar este frame?'))) {
      var collection = this.options.frameModel.collection;
      this.options.frameModel.destroy({ wait: true });
    }
    return false;
  },

  _onPopupClose: function (e) {
    if (e && e.preventDefault) { e.preventDefault(); }
    this._popupView.closePopUp();
  }

});
