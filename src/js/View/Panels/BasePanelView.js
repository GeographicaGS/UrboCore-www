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

App.View.Panels.Base = App.View.Container.extend({
  _template: _.template( $('#dashboard_template').html() ),

  initialize: function(options) {
    App.View.Container.prototype.initialize.call(this,options);
    options = _.defaults(options, {
      dateView: true,
      dateViewMaxRange: moment.duration(1, 'months'),
      dateViewModel: App.ctx,
      manageNavBar: true,
      spatialFilter: true,
      filterView: true,
      filterViewOpen:false
    });
    // @alasarr says: I want to remove this lines
    for (var i in options)
      this[i] = options[i];

    this.panelList = new App.Collection[App.Utils.capitalizeFirstLetter(this.id_category)].PanelList(null,options);
    //this.panelList.fetch({scope: this.scopeModel.get('id')});

    this.category = this.scopeModel.get('categories').get(this.id_category);

    if (this.filterView){
      this.filterModel = App.getFilter(this.id_category);
      if(this.id_category === 'dumps') { // TODO: Please fix this
        if (!this.filterModel) {
          this.filterModel = new App.Model.Dumps.Filter();
          App.setFilter(this.id_category,this.filterModel);
        }

        this.subviews.push(new App.View.Filter.Dumps({
          open: this.filterViewOpen,
          model: this.filterModel
        }));
      } else if(this.id_category === 'transport') {
        this.subviews.push(new App.View.Filter.Transport.Vehicles({
          scope: this.scopeModel.get('id'),
          open: true
        }));
      } else if (this.id_category === 'touring') {
        if (!this.filterModel) {
          this.filterModel = new App.Model.Touring.Filter();
          App.setFilter(this.id_category,this.filterModel);
        }

        this.subviews.push(new App.View.Filter.Touring.Visitors({
          scope: this.scopeModel.get('id'),
          model: this.filterModel,
          open: true
        }));
      }
    }

    if (this.spatialFilter)
      this.subviews.push(new App.View.Map.FilterSpatial());

    if (this.dateView)
      this.subviews.push(new App.View.Date({
        compact: false,
        maxRange: this.dateViewMaxRange,
        model: this.dateViewModel
      }));
  },

  events: {
    "click a.goToVertical" : "_goToVerticalLink"
  },

  _goToVerticalLink: function(e) {
    e.preventDefault();
    $(".menuPanel").toggleClass("active");
    $(".navElement.menu").addClass("active");
    $("#menuPanel").removeClass("translateRight");
  },

  render: function(){
    this.$el.html(this._template());

    for (var i in this.subviews)
      this.$el.append(this.subviews[i].render().$el);

    if (this.manageNavBar){
      var navBar = App.getNavBar();
      // if (this.master && !navBar.get('backurl') && this.scopeModel.get('categories').length==1){
      //   navBar.set('backurl','/');
      // }

      var listCollection =  new Backbone.Collection(this.panelList.toJSON());
      listCollection.get(this.id_panel).set('selected', true);

      var url = this.scopeModel.get('id') + '/categories/welcome';
      if(this.scopeModel.get('categories').length === 1) {
        url = '';
      }

      var sectionTitle;
      if (this.id_category === 'correlations') {
        sectionTitle = __('Correlations');
      } else if (this.id_category === 'frames') {
        sectionTitle = __('City Analytics');
      } else {
        sectionTitle = this.category.get('name');
      }

      var breadcrumb = [
        listCollection.toJSON(),
        {
          url: this.scopeModel.get('id') + '/' + this.id_category + '/dashboard',
          title: sectionTitle
        },
        {
          url: url,
          title: this.scopeModel.get('name')
        }
      ];

      if (this.scopeModel.get('multi')){
        var parentModel = App.mv().getScope(this.scopeModel.get('parent_id'));
        breadcrumb.push({
          url: 'scope/' + parentModel.get('id'),
          title: parentModel.get('name')
        });
      }

      // var backurl = null;
      // if(this.scopeModel.get('categories').length === 1) {
      //   backurl = Backbone.history.getFragment();
      // }

      navBar.set({
        visible : true,
        breadcrumb : breadcrumb,
        // backurl: backurl,
        scopeInfo: App.Utils.toDeepJSON(this.scopeModel),
        cities:[],
        section: this.id_category,
        scopeLoaded: this.scopeModel.get('id'),
        menu: { showable : true}
      });
    }

    var $title_page = this.$('.title_page');
    $title_page.addClass(this.id_category + 'ColorBefore');
    $title_page.addClass(this.id_category + 'IconBeforeM');
    $title_page.html(this.title);

    if((App.getMetadata().getCategory(this.id_category) || this.id_category == 'correlations' || this.id_category === 'frames') && App.getMetadata().getAdditionalInfo(this.id_category)) {
      var title;
      if (this.id_category === 'correlations') {
        title = __('Correlaciones');
      } else if (this.id_category == 'frames') {
        title = __('City Analytics');
      } else {
        title =  __(App.getMetadata().getCategory(this.id_category).get('name'));
      }
      $title_page.prepend(
        '<span class="vertical" style="background-color:' +
        App.getMetadata().getAdditionalInfo(this.id_category).colour +';">' + title + '</span>'
      );
    }

    if (this.master)
      $title_page.addClass('master');

    this.setFooter();

    if (this.id_category !== 'correlations' && this.id_category !== 'frames' && this.scopeModel.get('categories').get(this.id_category).get('nodata')===true)
      this.$('.widgets').html('<div class="nodata"><p>' + __('No hay datos para este vertical') + '</p></div>');
    else
      this.customRender();

  },
  customRender: function () {},

  setFooter: function () {
    var logosContainer = $('footer.footer .logos');
    logosContainer.empty();
    if(this.category) {
      var categoryConfig = this.category.get('config');
      if(categoryConfig && categoryConfig.companies) {
        categoryConfig.companies.forEach(function (company) {
          logosContainer.append('<a href="' + company.url + '" target="_blank"><img src="' + company.logo + '" alt="' + company.name + '" /></a>');
        });
      }
    }
  }
});
