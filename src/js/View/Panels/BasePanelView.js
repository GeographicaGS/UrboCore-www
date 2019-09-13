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
 * This View is used into the route 'categoryDashboard', any 'panel'
 * that we create must extend from this Object.
 * 
 * A 'panel' is the unit where all widgets are loaded.
 * 
 * A 'vertical' has to have at least a panel named 'master' and
 * we will envolve it in the Object 'App.View.Panels.<vertical_name>.Master'
 */
App.View.Panels.Base = App.View.Container.extend({
  _template: _.template($('#dashboard_template').html()),

  initialize: function (options) {
    App.View.Container.prototype.initialize.call(this, options);

    this.listenTo(this.framesCol, 'reset', this.render);
    
    options = _.defaults(options || {}, {
      dateView: true,
      dateViewMaxRange: moment.duration(1, 'year'),
      dateViewModel: App.ctx,
      manageNavBar: true,
      spatialFilter: true,
      filterView: true,
      filterViewOpen: false,
      framesList: false
    });

    // @alasarr says: I want to remove this lines
    for (var i in options)
      this[i] = options[i];

    // Select panel in the top page
    this.panelList = new App.Collection[App.Utils.capitalizeFirstLetter(this.id_category)]
      .PanelList(null, options);

    this.category = this.scopeModel.get('categories').get(this.id_category);

    // Filters (_layerTree)
    if (this.filterView) {
      this.filterModel = App.getFilter(this.id_category);
      if (this.id_category === 'dumps') { // TODO: Please fix this
        if (!this.filterModel) {
          this.filterModel = new App.Model.Dumps.Filter();
          App.setFilter(this.id_category, this.filterModel);
        }
        this._layerTree = new App.View.Filter.Dumps({
          open: this.filterViewOpen,
          model: this.filterModel
        });
        this.subviews.push(this._layerTree);
      } else if (this.id_category === 'transport') {
        this._layerTree = new App.View.Filter.Transport.Vehicles({
          scope: this.scopeModel.get('id'),
          open: true
        });
        this.subviews.push(this._layerTree);
      } else if (this.id_category === 'touring') {
        if (!this.filterModel) {
          this.filterModel = new App.Model.Touring.Filter();
          App.setFilter(this.id_category, this.filterModel);
        }
        this._layerTree = new App.View.Filter.Touring.Visitors({
          scope: this.scopeModel.get('id'),
          model: this.filterModel,
          open: true
        });
        this.subviews.push(this._layerTree);
      }
    }

    this.$el.attr('data-time-filter', this.dateView);

    if (this.spatialFilter) {
      this.filterSpatialView = new App.View.Map.FilterSpatial();
      this.subviews.push(this.filterSpatialView);
    }

    if (this.dateView) {
      this._dateView = new App.View.Date({
        compact: false,
        maxRange: this.dateViewMaxRange,
        model: this.dateViewModel
      });
      this.subviews.push(this._dateView);
    }
  },

  events: {
    "click a.goToVertical": "_goToVerticalLink",
    "click .add-iframe": "createFrame",
  },

  _goToVerticalLink: function (e) {
    e.preventDefault();
    $(".menuPanel").toggleClass("active");
    $(".navElement.menu").addClass("active");
    $("#menuPanel").removeClass("translateRight");
  },

  render: function () {
    this.$el.html(this._template());
    this.$el.attr('data-vertical', this.id_category);

    for (var i in this.subviews)
      this.$el.append(this.subviews[i].render().$el);

    if (this.framesList) {
      this.framesCol = new App.Collection.Frames.ScopeFrames([], {
        scope: this.scopeModel.id
      });
      this.framesCol.type = 'vertical';
      this.framesCol.vertical = this.category.id;

      if (App.auth && App.auth.getUser() && App.auth.getUser().superadmin) {
        this.$el.append('<div class="add-iframe"><div><span>' + __('Añadir Frame') + '</span></div></div>');
        var _this = this;
        this.listenTo(this.framesCol, 'update', function () {
          if (_this._popupView) {
            _this._onPopupClose();
          }
          _this._widgets = [];
          _this.drawFrames();
        });
        this.framesCol.fetch({ reset: true });
      }
    }
    if (this.manageNavBar) {
      var navBar = App.getNavBar();
      var vertical = this.scopeModel.get('categories').get(this.vertical);

      var listCollection = new Backbone.Collection(this.panelList.toJSON());
      listCollection.get(this.id_panel).set('selected', true);

      var url = this.scopeModel.get('id') + '/categories/welcome';

      //This lines makes backurl links to homepage from scope when it has only one vertical,
      //preventing from goint to multiscope map on children scopes
      // if(this.scopeModel.get('categories').length === 1) {
      //   url = '';
      // }

      var sectionTitle;
      if (this.id_category === 'correlations') {
        sectionTitle = __('Correlations');
      } else if (this.id_category === 'frames') {
        if (vertical) {
          sectionTitle = __(vertical.get('name'));
        } else {
          sectionTitle = __('City Analytics');
        }
      } else {
        sectionTitle = this.category.get('name');
      }

      var breadcrumb = [
        listCollection.toJSON(),
        {
          url: this.scopeModel.get('id') + '/' + ((!vertical) ? this.id_category : this.vertical) + '/dashboard',
          title: sectionTitle
        },
        {
          url: url,
          title: this.scopeModel.get('name')
        }
      ];

      //this.scopeModel.get('multi') is returning false for multiscope verticals
      var parent = this.scopeModel.get('parent_id')
      if (parent && parent != 'orphan') {
        var parentModel = App.mv().getScope(parent);
        breadcrumb.push({
          url: parentModel.get('id') + '/scope',
          title: parentModel.get('name')
        });
      }

      // var backurl = null;
      // if(this.scopeModel.get('categories').length === 1) {
      //   backurl = Backbone.history.getFragment();
      // }

      navBar.set({
        visible: true,
        breadcrumb: breadcrumb,
        scopeInfo: App.Utils.toDeepJSON(this.scopeModel),
        cities: [],
        section: this.id_category,
        scopeLoaded: this.scopeModel.get('id'),
        menu: { showable: true },
      });
    }

    var $title_page = this.$('.title_page');
    $title_page.addClass(this.id_category + 'ColorBefore');
    $title_page.addClass(this.id_category + 'IconBeforeM');
    $title_page.html(this.title);

    if ((App.getMetadata().getCategory(this.id_category) || this.id_category == 'correlations' || this.id_category === 'frames') && App.getMetadata().getAdditionalInfo(this.id_category)) {
      var title;
      if (this.id_category === 'correlations') {
        title = __('Correlaciones');
      } else if (this.id_category == 'frames') {
        title = __('City Analytics');
      } else {
        title = __(App.getMetadata().getCategory(this.id_category).get('name'));
      }
      $title_page.prepend(
        '<span class="vertical" style="background-color:' +
        App.getMetadata().getAdditionalInfo(this.id_category).colour + ';">' + title + '</span>'
      );
    }

    if (this.master)
      $title_page.addClass('master');

    this.setFooter();

    if (this.id_category !== 'correlations'
      && this.id_category !== 'frames'
      && this.scopeModel.get('categories').get(this.id_category).get('nodata') === true) {
      this.$('.widgets').html('<div class="nodata"><p>' + __('No hay datos para este vertical') + '</p></div>');
    } else {
      this.customRender();
      if (this.framesList) {
        this.drawFrames();
      }
    }

    return this;
  },

  /**
   * To customize in child view
   */
  customRender: function () {
    // TODO in child
  },

  setFooter: function () {
    var logosContainer = $('footer.footer .logos');
    logosContainer.empty();
    if (this.category) {
      var categoryConfig = this.category.get('config');
      if (categoryConfig && categoryConfig.companies) {
        categoryConfig.companies.forEach(function (company) {
          logosContainer.append('<a href="' + company.url + '" target="_blank"><img src="' + company.logo + '" alt="' + company.name + '" /></a>');
        });
      }
    }
  },

  createFrame: function (e) {
    e.preventDefault();

    var _this = this;
    if (this._popupView == undefined) {
      var popupModel = new Backbone.Model({
        title: __('Nuevo frame')
      });
      this._popupView = new App.View.PopUp({
        model: popupModel
      });
    }

    var editView = new App.View.Widgets.Frame.FrameEdit({
      collection: this.framesCol
    });
    this._popupView.internalView = editView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(editView, 'close', this._onPopupClose);

    this._popupView.show();
  },

  drawFrames: function () {
    var _this = this;
    _this.$('.widgetFrame').remove();
    this.framesCol.fetch({
      data: { vertical: _this.category.id, type: 'vertical' }, success: function (response) {
        var _widgets2 = [];

        response.each(function (elem, idx) {
          _widgets2.push(new App.View.Widgets.Frame.BaseFrame({
            link: '/' + _this.scopeModel.get('id') + '/' + _this.category.id + '/frames/' + elem.id,
            frameModel: elem,
            dimension: '',
          }));
        });
        _this.$('.widgets').append(new App.View.Widgets.Container({
          widgets: _widgets2,
          el: _this.$('.widgets'),
        }));
        _this.$('.widgets').masonry('reloadItems', {
          gutter: 20,
          columnWidth: 360
        });
      }, reset: true
    });
  },

  onClose: function () {
    App.View.Container.prototype.onClose.call(this);
    if (this.filterSpatialView) {
      this.filterSpatialView.close()
    };
  },

  _onPopupClose: function (e) {
    this._popupView.closePopUp();
  }
});
