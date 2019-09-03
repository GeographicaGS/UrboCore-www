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

App.View.Widgets.SelectableVariable = App.View.Widgets.Base.extend({
  _template: _.template($('#widgets-widget_selectableVariable_template').html()),

  // TODO: Refactor Widget.Base to allow extending config
  initialize: function (options) {
    this.options = options || {};

    // Set permissions over differents variables of entity
    this.options.selectableVariables = _.filter(this.options.selectableVariables, function (variable) {
      return App.mv().validateInMetadata({ 'variables': [variable.id] });
    });

    this.model = new App.Model.Widgets.Base({
      title: this.options.title,
      link: this.options.link,
      titleLink: this.options.titleLink || null,
      infoTemplate: this.options.infoTemplate,
      timeMode: this.options.timeMode,
      refreshTime: this.options.refreshTime,
      dimension: this.options.dimension || '',
      type: this.options.type || '',
      selectableVariables: this.options.selectableVariables || [],
      exportable: this.options.exportable || false,
      publishable: this.options.publishable || false,
      classname: this.options.classname || '',
      embed: this.options.embed || false,
      permissions: this.options.permissions || {}
    });

    this.model.set('currentVariable', options.selectableVariables[0] ? options.selectableVariables[0].id : '');

    if (this.model.get('timeMode') == 'historic') {
      this.listenTo(App.ctx, 'change:start change:finish', this.refresh);
    }

    this.listenTo(App.ctx, 'change:bbox', this.refresh);

    if (this.model.get('refreshTime')) {
      this._setRefreshInterval()
    }

    this.subviews = [];
    this.filterables = [];

    this.filterModel = App.getFilter(this.options.id_category);
    if (this.filterModel) {
      this.listenTo(this.filterModel, 'change', this._onChangeFilter);
    }

    _.bindAll(this, '_drawContent');

    this._drawContent();
  },


  events: _.extend({
    'click .popup_widget.variableSelector .varsel li': '_changeVar'
  }, App.View.Widgets.Base.prototype.events),

  _changeVar: function (e) {
    var $target = $(e.currentTarget);
    this.model.set('currentVariable', $target.data('varid'));

    this.$('.popup_widget.variableSelector > span').html($target.html());
    this.$('.popup_widget.variableSelector .selected').removeClass('selected');
    $target.addClass('selected');

    this._drawContent();
    this.refresh();
  },

  _drawContent: function () {
    throw new Error('_drawContent not implemented');
  },

  /**
   * behaviour when "close" the current view
   */
  onClose: function () {
    this.stopListening();
  }

});
