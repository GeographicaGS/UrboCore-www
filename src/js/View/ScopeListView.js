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

App.View.ScopeList = Backbone.View.extend({
  _template: _.template( $('#scope_list_template').html() ),
    _popupTemplateMiniArea: _.template('<div class="popup hover"><div class="summary"><p class="noMargin"><span class="title" style="text-transform: none;"><%= title %></span></p></div></div>'),

  initialize: function(options) {
    // this.modelScope = new App.Model.Scope();
    // this.modelScope.url = this.modelScope.urlRoot + '/' + this.model.get('scope');
    // this.listenTo(this.modelScope,"change",this._onModelFetched);
    // this.modelScope.fetch();
    this.scope = this.model.get('scope');
    this.modelScope = App.mv().getScope(this.scope);

    App.getNavBar().set({
      visible : true,
      menu: {
        showable:false
      }
    });
    this.render();

    this._onModelFetched();
  },

  events: {
    'click .toggleSelector li': 'toggleView'
  },


  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({'scopes':null}));
    this.$('.title_page').append(App.circleLoading());

    var _this = this;
    setTimeout(function(){
      _this._setupMap();
    },100);

    return this;
  },

  _onModelFetched:function(){
    this.$el.html(this._template({
      scopes: App.Utils.toDeepJSON(this.modelScope.get('childs'))
    }));
    App.getNavBar().set({
      cities: App.Utils.toDeepJSON(this.modelScope.get('childs')),
      scopeInfo:{},
      section:undefined,
      breadcrumb : [{
        url: this.scope + '/scope',
        title : this.modelScope.get('name')
      }/*,
      {
        url: this.scope + '/dashboard',
        title : 'Ámbitos'
      }*/]
    });
  },

  _setupMap: function () {
    this.$map = this.$('.map');
    this.map = new L.Map(this.$map[0], {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 100,
      scrollWheelZoom: false
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      minZoom: 0,
      maxZoom: 20
    }).addTo(this.map);

    this.map.setView(this.modelScope.get('location'), this.modelScope.get('zoom') || 8);

    var _this = this;

    // Load markers
    var markerIcon = L.icon({
      iconUrl: '/img/SC_icmap_ambito.svg',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    this.modelScope.get("childs").forEach(function(child) {
      var link;
      var s = App.Utils.toDeepJSON(child);
      var numVerticals = s.categories.length;

      if(numVerticals >= 1) {
        link = s.id + "/categories/welcome";
      } else {
        link = s.id + "/frames/dashboard";
      }
      L.marker(s.location, {icon: markerIcon})
        .addTo(_this.map)
        .on('click', function (e) {
          App.getNavBar().set('backurl',Backbone.history.getFragment());
          App.router.navigate(link, {trigger: true});
        })
        .bindPopup(_this._popupTemplateMiniArea({ title: s.name }), {closeButton: false, className: 'hoverPopup', offset: L.point(0, -6)})
        .on('mouseover', function (e) {
          this.openPopup();
        })
        .on('mouseout', function (e) {
          this.closePopup();
        });
    });

    setTimeout(function () {
      _this.map.invalidateSize();
    }, 100);
  },

  toggleView: function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);

    var $gridSection = this.$('.container.grid');
    var $mapSection = this.$('.mapContent');
    switch ($target.data('section')) {
      case 'grid':
        $gridSection.removeClass('hide');
        $mapSection.addClass('hide');
        break;
      case 'map':
        $gridSection.addClass('hide');
        $mapSection.removeClass('hide');
    }

    $target.siblings().removeClass('selected')
          .children('.icon').removeClass('selected');
    $target.addClass('selected').children('.icon').addClass('selected');
  }
});
