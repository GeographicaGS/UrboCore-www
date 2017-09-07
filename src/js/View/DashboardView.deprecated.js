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
    // this.listenTo(this.scopeModel,"change:id",this._createDashboard);
    // this.scopeModel.fetch({"reset": true});
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
      App.getNavBar().set({
        breadcrumb : [{
          url: scope + '/tourism/dashboard',
          title : 'Turismo'
        },
        {
          url: scope + '/dashboard',
          title : this.scopeModel.get('name')
        }]
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

      App.getNavBar().set({
        breadcrumb : [{
          url: scope + '/watering/dashboard',
          title : 'Riego'
        },
        {
          url: scope + '/dashboard',
          title : this.scopeModel.get('name')
        }]
      });

      this.$('.title_page').text('Dashboard de Riego');
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

      this._widgets.push(new App.View.Widgets.Watering.Consumption({
        id_scope: this.scopeModel.get('id')
      }));

      // var wasteLinkModel = new Backbone.Model({
      //   'title': 'Análisis de variables',
      //   'buttonLink': '/' + scope + '/watering/analysisVars',
      //   'buttonText': 'EMPEZAR',
      //   'isExternalLink': false,
      //   'imgBackground': 'SC_ic_analizar_XL.svg'
      // });
      //
      // var wasteLinkWidget = new App.View.Widgets.ButtonLinkBackground({
      //   'model': wasteLinkModel
      // });
      // this._widgets.push(wasteLinkWidget);

    } else if (section == 'waste'){
      App.getNavBar().set({
        breadcrumb : [{
          url: scope + '/waste/dashboard',
          title : __('Seguimiento de contratas')
        },
        {
          url: '/' + scope + '/dashboard',
          title : __(this.scopeModel.get('name'))
        }]
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

      // var stackCollection = new App.Collection.Variables.Now([],{'scope':this.scopeModel.get('id')});
      // // var stackCollection = new App.Collection.Waste.WasteStacked([],{'scope':this.scopeModel.get('id')});
      // this._widgets.push(new App.View.Widgets.Dumps.TotalWeight({'id_scope':this.scopeModel.get('id'), 'collection':stackCollection}));

      this.listenTo(this._ctx,'change:start change:finish',this._render_widgets);

      // var wasteIssuesCategorizedCollection = new App.Collection.WidgetContext([],
      //   {
      //     'url': App.config.api_url + '/' + this.scopeModel.get('id') + '/waste/issues/resolution',
      //     'data': { 'agg':'max' }
      //   }
      // );
      // var wasteIssuesCategorizedWidget = new App.View.Widgets.CategorizedVariableValue({
      //   'category': 'Residuos',
      //   'title': 'Tiempo medio de resolución de incidencias por categorías',
      //   'cssClass': 'wasteAverageTime',
      //   'titleFunc': function(d){return App.Static.Collection.Waste.IssueCategories.get(d).get('name')},
      //   'iconFunc': function(d){return App.Static.Collection.Waste.IssueCategories.get(d).get('class')},
      //   'dataFunc': function(d){
      //     var time = moment.duration(d, 'seconds');
      //     return time.hours();
      //   },
      //   'collection':wasteIssuesCategorizedCollection,
      //   'unit': 'h'
      // });
      // this.listenTo(wasteIssuesCategorizedWidget,'widget:ready',this._render_widgets);
      // wasteIssuesCategorizedWidget.listenTo(this._ctx,'change:start change:finish',wasteIssuesCategorizedWidget.render);
      // this._widgets.push(wasteIssuesCategorizedWidget);

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
        'var_id':'waste.ilv.indicator',
        // 'timeinstant':timeinstant
        'date': scope === 'guadalajara' ? new Date(2017,5,1) : new Date(2016,7,1),
        'url': '/' + scope + '/waste/indicators',
        'extra_info': {
          'unit': '%',
          'format': function(d){return App.nbf(d * 100,4)},
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
