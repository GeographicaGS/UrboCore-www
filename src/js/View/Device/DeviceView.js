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

App.View.Device = Backbone.View.extend({
  _template: _.template($('#devices-basic_template').html()),

  className: 'device_detail',

  initialize: function (options) {
    this.scopeModel = App.mv().getScope(this.model.get('scope'));
    this.model.url = this.model.durl() + '/metadata?deventity=' + this.model.get('entity');
    this.listenTo(this.model, 'change:tab', this._renderTab);
  },

  events: {
    'click .nav_ctrl li': '_changeControl'
  },

  onClose: function () {
    this.stopListening();

    for (var i in this._tabs)
      if (this._tabs[i]) this._tabs[i].close();


    if (this._deviceListView)
      this._deviceListView.close();

    if (this._dateView)
      this._dateView.close();


    if (this._subheader) this._subheader.close();

  },

  _changeControl: function (e) {
    var $e = $(e.target),
      tab = $e.attr('data-el').substring(5);

    this.model.set('tab', tab);
  },

  _renderTab: function (e) {
    var _this = this;
    _.each(this._tabs, function (nil, tab) {
      if (_this._tabs[tab]) {
        _this._tabs[tab].close();
      }
    });
    var v = this._tabs[this.model.get('tab')];
    this.$('.ctrl_container').html(v.$el);
    this.$('.nav_ctrl ul li').removeAttr('selected');
    this.$('.nav_ctrl [data-el=ctrl_' + this.model.get('tab') + ']').attr('selected', true);

    v.render().delegateEvents();
    App.router.navigate('/' + this.model.get('scope') + '/' + this.model.get('entity') + '/' + this.model.get('id') + '/' + this.model.get('tab'));
    this._showDateSelector();

  },

  _initBaseViews: function () {

    var breadcrumb = [{
      url: this.model.get('scope') + '/' + this.model.get('entity') + '/' + this.model.get('id'),
      title: __('Ficha de dispositivo')
    },
    {
      url: this.model.get('scope') + '/' + this.model.get('entity').split('.')[0] + '/dashboard',
      title: __(App.mv().getCategory(this.model.get('entity').split('.')[0]).get('name'))
    },
    {
      url: this.model.get('scope') + '/dashboard',
      title: __(this.scopeModel.get('name'))
    }];

    // Adds multiscope level to breadcrumb
    // If scope has parent (multiscope)
    var parent = this.scopeModel.get('parent_id');
    if (parent && parent != 'orphan') {
      var parentModel = App.mv().getScope(parent);

      breadcrumb.push({
        url: parent + '/' + 'scope',
        title: __(parentModel.get('name'))
      });
    }

    App.getNavBar().set({
      breadcrumb: breadcrumb,
      visible: true
    });

    var entityMetadata = App.mv().getEntity(this.model.get('entity'));
    var entityAdditionalInfo = App.mv().getAdditionalInfo(this.model.get('entity'));
    if (entityMetadata && entityAdditionalInfo) {
      this.$('.device_type').html(__(entityMetadata.get('name')));
      this.$('.device_type').css({ 'color': entityAdditionalInfo.colour });
      if (entityAdditionalInfo.icon) this.model.set({ icon: entityAdditionalInfo.icon });
    }
    this.$('.device_name').html(this.model.get('id'));
    this.$('.deviceinfo').css({ 'background-image': 'url(/img/' + this.model.get('icon') + ')' });

    // TAB 1
    var otherView;
    switch (this.model.get('entity')) {
      case 'watering.sosteco.solenoidvalve':
        otherView = new App.View.Watering.OtherView({ model: new Backbone.Model(this.model.toJSON()) });
        break;
      default:
        otherView = null;
    }

    // If we need a custom device view to a particular entity
    // we will create in the vertical the files with the next name
    // App.view.[Category].DeviceLastData.[Entity] <-- example to "DeviceLastData"
    var categoryClassName = '';
    var entityClassName = '';
    var entityData = this.model.get('entity').split('.');

    _.each(entityData, function (item, index) {
      if (index === 0) {
        categoryClassName = App.Utils.capitalizeFirstLetter(item);
      }
      if (index === entityData.length - 1) {
        entityClassName = App.Utils.capitalizeFirstLetter(item);
      }
    });

    this._tabs = {
      'lastdata': App.Utils.getAttrObject(App.View.Device, categoryClassName.concat('.DeviceLastData.', entityClassName), false)
        ? new App.View.Device[categoryClassName].DeviceLastData[entityClassName]({
          model: this.model
        })
        : new App.View.DeviceLastData({
          model: this.model
        }),
      'period': App.Utils.getAttrObject(App.View.Device, categoryClassName.concat('.DevicePeriod.', entityClassName), false)
        ? new App.View.Device[categoryClassName].DevicePeriod[entityClassName]({
          model: this.model
        })
        : new App.View.DevicePeriod({
          model: new Backbone.Model(this.model.toJSON())
        }),
      'raw': App.Utils.getAttrObject(App.View.Device, categoryClassName.concat('.DeviceRaw.', entityClassName), false)
        ? new App.View.Device[categoryClassName].DeviceRaw[entityClassName]({
          model: new Backbone.Model(this.model.toJSON())
        })
        : new App.View.DeviceRaw({
          model: new Backbone.Model(this.model.toJSON())
        }),
      'other': App.Utils.getAttrObject(App.View.Device, categoryClassName.concat('.DeviceOther.', entityClassName), false)
        ? new App.View.Device[categoryClassName].DeviceOther[entityClassName]({
          model: new Backbone.Model(this.model.toJSON())
        })
        : otherView
    };

    this._renderTab();
  },

  _showDateSelector() {
    if (this.model.get('tab') === 'lastdata') {
      $('#dateSelector').hide();
    } else {
      $('#dateSelector').show();
    }
  },

  render: function () {
    this.$el.html(this._template({ 'entity': this.model.get('entity') }));

    this.model.set(App.mv().getEntityMetadata(this.model.get('entity')));
    this._initBaseViews();

    var deviceListModel = new Backbone.Model({
      'id': this.model.get('id'),
      'scope': this.model.get('scope'),
      'entity': this.model.get('entity')
    });
    this._deviceListView = new App.View.DeviceList({ 'model': deviceListModel });
    this.$('.deviceinfo').append(this._deviceListView.$el);

    this._dateView = new App.View.Date({
      compact: false,
    });

    this.$el.append(this._dateView.render().$el);
    // dateView need time to be rendered  before to check if show or hide
    setTimeout(this._showDateSelector.bind(this), 100);

    return this;
  }

});
