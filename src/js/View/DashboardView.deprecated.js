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

App.View.Dashboard = Backbone.View.extend({
  _template: _.template( $('#dashboard_template').html() ),

  initialize: function(options) {

    App.getNavBar().set({
      visible : true,
      menu: { showable : true},
      breadcrumb : null
    });

    this._widgets = [];
    this._widgetModels = [];
    this._ctx = App.ctx;
    this.scopeModel = App.mv().getScope(this.model.get('scope'))
    this.render();
    this._createDashboard();
  },

  onClose: function(){

    _.each(this._widgets,function(widget){
      if(widget && widget.close) widget.close();
    });

    if(this._dateView)
      this._dateView.close();

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());
    this.$('.title_page').append(App.circleLoading());

    this._dateView = new App.View.Date({'compact':false});
    this.$el.append(this._dateView.render().$el);

    return this;
  },

  _createDashboard: function(){
    var scope = this.scopeModel.get('id');
    var section = this.model.get('section');

    if( section  == 'tourism'){
      var breadcrumb = [
        [
          {
            id:'master',
            title: __('Estado general'),
            url:scope + '/tourism/dashboard',
            selected:true
          },
          {
            id:'offers',
            title: __('Ranking de oferta'),
            url:scope + '/tourism/ranking/offer'
          },
          {
            id:'demands',
            title: __('Ranking de demanda'),
            url:scope + '/tourism/ranking/demand'
          },
          {
            id:'activities',
            title: __('Actividades turísticas'),
            url:scope + '/tourism/activities'
          }
        ],
        {
        url: scope + '/tourism/dashboard',
        title : __('Turismo')
      },
      {
        url: scope + '/dashboard',
        title : __(this.scopeModel.get('name'))
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
        section:section,
        breadcrumb : breadcrumb
      });
      this.$('.title_page').text('Dashboard de Turismo');

      this._widgets.push(new App.View.WidgetTourismBarChart({
        'id':this.scopeModel.get('id'),
        'title':'Ranking de oferta',
        'category_name':'Turismo',
        'type':'offer',
        'barColor':'#fd8139'
      }));
      this._widgets.push(new App.View.WidgetTourismBarChart({
        'id':this.scopeModel.get('id'),
        'title':'Ranking de demanda',
        'category_name':'Turismo',
        'type':'demand',
        'barColor':'#fdb35f'}));
      this._widgets.push(new App.View.WidgetTourismActivity({
        'id':this.scopeModel.get('id'),
        'title':'Tipos de actividades turísticas',
        'category_name':'Turismo'
      }));
    }
    else if (section == 'watering'){
      var breadcrumb = [    
        [
          {
            id:'master',
            title: __('Estado General'),
            url:scope + '/watering/dashboard',
            selected:true
          },
          {
            id:'mapdevices',
            title: __('Tiempo Real'),
            url:scope + '/watering/map'
          },
          {
            id:'operation',
            title: __('Operación'),
            url:scope + '/watering/operation'
          },
          {
            id:'consumption',
            title: __('Consumo de agua'),
            url:scope + '/watering/consumption'
          }
        ],
        {
          url: scope + '/watering/dashboard',
          title : __('Riego')
        },
        {
          url: scope + '/dashboard',
          title : __(this.scopeModel.get('name'))
        }
      ];

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
        section: section,
        breadcrumb : breadcrumb
      });

      this.$('.title_page').text('Estado General');
      this.$('.title_page').prepend(
        '<span class="vertical" style="background-color:' +
        '#00ccff;">' + 'Riego' + '</span>'
      );
      var m = new App.Model.Widgets.Base({
        entities : ['watering.sosteco.weatherstation','watering.sosteco.solenoidvalve','watering.sosteco.sensor'],
        location : this.scopeModel.get('location'),
        zoom: this.scopeModel.get('zoom'),
        scope: this.scopeModel.get('id'),
        section: section,
        color: '#00d5e7',
        timeMode:'now'
      });
      
      this._widgets.push(new App.View.WidgetDeviceMap({model: m}));

      this._widgets.push(new App.View.Widgets.Watering.Operation({
        id_scope:this.scopeModel.get('id'),
      }));

      //For some reason when this widget loads all graphs get corrupted
      this._widgets.push(new App.View.Widgets.Watering.Consumption({
        id_scope: this.scopeModel.get('id')
      }));

    } else if (section == 'waste'){

      var breadcrumb = [
        [
          {
            id:'master',
            title: __('Estado general'),
            url:scope + '/waste/dashboard',
            selected:true
          },
          {
            id:'map',
            title: __('Inventariado'),
            url:scope + '/waste/map'
          },
          {
            id:'issues',
            title: __('Incidencias'),
            url:scope + '/waste/operation/issues'
          },
          {
            id:'indicators',
            title: __('Indicadores'),
            url:scope + '/waste/indicators'
          }
        ],
        {
          url: scope + '/waste/dashboard',
          title : __('Seguimiento de contratas')
        },
        {
          url: '/' + scope + '/dashboard',
          title : __(this.scopeModel.get('name'))
        }
      ];

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
        section:section,
        breadcrumb : breadcrumb
      });

      this.$('.title_page').text(__('Seguimiento de contratas'));
      var m = new App.Model.Widgets.Base({
        id: 'MOBA',
        entities : ['waste.moba'],
        location : this.scopeModel.get('location'),
        zoom: this.scopeModel.get('zoom'),
        scope: this.scopeModel.get('id'),
        section: section,
        color: '#00d5e7',
        timeMode:'now'
      });
      this._widgets.push(new App.View.WidgetDeviceMap({model: m}));

      this._widgets.push(new App.View.Widgets.Waste.WidgetIssueStacked({'scope':this.scopeModel.get('id')}));

      this.listenTo(this._ctx,'change:start change:finish',this._render_widgets);

      var wasteIssuesValueModel = new App.Model.SimpleValue(
        {
          'title': __('Incidencias Solucionadas')
        },{
        'url': App.config.api_url + '/' + this.scopeModel.get('id') + '/waste/issues/total/closed',
      });

      // Facebook widget
      if (this.scopeModel.get('id') == 'guadalajara')
        this._widgets.push({el: $('<iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FSmartguadalajara-Guadalajaralimpia1-1995114204047044%2F&tabs=timeline&width=360&height=740&small_header=true&adapt_container_width=false&hide_cover=true&show_facepile=false&appId" width="360" height="740" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>')});

      var wasteIndicatorModel = new App.Model.Waste.Indicator({
        scope: this.scopeModel.get('id'),
        id: '0'
      });
      var wasteLviWidgetModel = new Backbone.Model({
        'className': 'lvigauge',
        'var_id': 'waste.ilv.indicator',
        // 'timeinstant':timeinstant
        'date': scope === 'guadalajara' ? new Date(2020, 3, 1) : new Date(2018, 7, 1),
        'url': '/' + scope + '/waste/indicators',
        'extra_info': {
          'unit': '%',
          'format': function(d){return App.nbf(d * 100, 4)},
          'class': function(d){
            if(d <= 90) return 'bad';
            else if (90 < d && d <= 95) return 'moderate';
            else return 'good';
          },
          'flag': function(d){
            if(d <= 80) return 'Penalización máxima';
            else if (80 < d && d <= 90) return __('Penalización progresiva');
            else if (90 < d && d <= 95) return __('Sin penalización');
            else if (95 < d && d < 100) return __('Bonificación progresiva');
            else return __('Bonificación máxima');
          }
        },
        'model': wasteIndicatorModel
      });
      var wasteIndicatorsWidget = new App.View.Widgets.Waste.LviGauge({'model': wasteLviWidgetModel}).render();
      this._widgets.push(wasteIndicatorsWidget);

      var wasteIssuesValueWidget = new App.View.Widgets.VariableValue({
        'model':wasteIssuesValueModel,
        'template': '#widgets-widget_simple_variable_value_template'
      });
      this.listenTo(wasteIssuesValueWidget,'widget:ready',this._render_widgets);
      wasteIssuesValueWidget.listenTo(this._ctx,'change:start change:finish',wasteIssuesValueWidget.render);
      this._widgets.push(wasteIssuesValueWidget);

      var wasteLinkModel = new Backbone.Model({
        'title': __('Servicio de recogida de Residuos y Limpieza Viaria'),
        'buttonLink': 'http://www.mawisu2.com/mawisu2/',
        'buttonText': __('PLANIFICACIÓN TAREAS'),
        'isExternalLink': true,
        'icons': ['../verticals/waste/img/issues/SC_ic_mova_widget-recogida.svg', '../verticals/waste/img/issues/SC_ic_mova_widget-limpieza.svg']
      });

      var wasteLinkWidget = new App.View.Widgets.ButtonLink({
        'model': wasteLinkModel
      });
      this._widgets.push(wasteLinkWidget);

    }

    App.getNavBar().set({
      scopeInfo: App.Utils.toDeepJSON(this.scopeModel),
      cities:[],
      section:section,
      scopeLoaded:this.scopeModel.get('id')
    });

    this.$('.title_page').attr("class", "title_page");
    this.$('.title_page').addClass(section + "ColorBefore");
    this.$('.title_page').addClass(section + "IconBeforeM");

    this._render_widgets();
  },

  _render_widgets: function(){
    var _this = this;
    _.each(this._widgets,function(widget){
      _this.$('.widgets').append(widget.el);
    });

    setTimeout(function(){
      _this.$('.widgets').masonry({
        gutter: 20
      });
      _this.$('.widget').addClass('active');
    },1);
  }

});
