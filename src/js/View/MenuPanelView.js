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

App.View.MenuPanel = Backbone.View.extend({

  _template: _.template( $('#menu_panel_template').html() ),

  _categories:['waste','watering','tourism','dumps','lighting','env_sensors','urban_issues','parking', 'transport', 'watmeter_a'],

  _templateCityList: _.template("<%_.each(cities, function(city, index) {%><div class='city'><a class='linkToCategories' href='#' data-index='<%=index%>'><%=city.name%></a><div class='categories'><%_.each(city.categories, function(category) {%><span class='rectangleIcon <%=category%>'></span><%})%></div></div><%})%>"),

  events: {
    "click a.linkToCities" : "_goToCities",
    "click a.linkToCategories" : "_goToCategories",
    "click a.linkToCategoryDashboard" : "_goToCategoryDashboard",
    "keyup .searchToolBox input" : "_changeSearchScope",
    "click .concurrence, .frames" : function(){
      App._navigationBar._closeMenu();
    }
  },

  initialize: function() {
    //Con esta variable se controla la logica del RENDER de ocultar o mostrar cada seccion (ciudades/ verticales)
    this.transition = false;
  },

  _changeSearchScope: function(e) {
    var search = $(e.target).val();
    if(search != undefined && search != "") {
      var cities = this.model.get("cities");
      var citiesFiltered = [];
      _.each(cities, function(city) {
        var name = city.name.toLowerCase();
        search = search.toLowerCase();
        if(name.indexOf(search) != -1) {
          citiesFiltered.push(city);
        }
      });
      this.$('.city_list').html(this._templateCityList({cities:citiesFiltered}));
    } else {
      this.$('.city_list').html(this._templateCityList({cities:this.model.get("cities")}));
    }
  },

  _goToCities: function(e) {
    e.preventDefault();
    $("#menuPanel").addClass("translateRight");
  },

  _goToCategories: function(e) {
    e.preventDefault();

    var indice = $(e.target).attr("data-index");
    if(_.isEmpty(this.model.get("scopeInfo"))) {
      this.model.set("scopeInfo", this.model.get("cities")[indice]);
      link = this.model.get("scopeInfo").id + "/dashboard";
      App.router.navigate(link, {trigger:true});
    } else {
      this.model.set("scopeInfo", this.model.get("cities")[indice]);
      this.transition = true;
      this.render();
      setTimeout(function() {
        $("#menuPanel").removeClass("translateRight");
      }, 0);
    }
  },

  _goToCategoryDashboard: function(e) {
    e.preventDefault();

    var category = $(e.target).attr("data-category");
    var link = this.model.get("scopeInfo").id + "/" + category + "/dashboard";
    App._navigationBar._closeMenu()
    App.router.navigate(link, {trigger:true});

  },

  render: function() {
    //Logica para controlar la seccion seleccionada en el panel
    var sectionSelected = this.model.get("section");
    if(sectionSelected !== 'correlations' && sectionSelected !== 'frames' &&  !_.some(this.model.get("scopeInfo").categories, function(el){ return el.id === sectionSelected; })) {
      sectionSelected = '';
    }

    this.$el.html(this._template({
      cities:this.model.get("cities"),
      scope_info:this.model.get("scopeInfo"),
      //categories:this._categories,
      sectionSelected:sectionSelected,
      scopeLoaded:this.model.get("scopeLoaded")
    }));

    this.$('.city_list').html(this._templateCityList({cities:this.model.get("cities")}));

    //Controlamos el muestreo de las dos vistas siempre y cuando haya datos (al menos ciudades)
    if(this.model.get("cities") && this.model.get("cities").length > 0 && !this.transition) {
      if(_.isEmpty(this.model.get("scopeInfo"))) {
        $("#menuPanel").addClass("translateRight");
      } else {
        $("#menuPanel").removeClass("translateRight");
      }
    }
    return this;
  },

  onClose: function() {
    this.stopListening();
  }
});
