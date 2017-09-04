'use strict';

App.View.Panels.Indicator = App.View.Container.extend({
  _template: _.template( $('#dashboard_indicator_template').html() ),

  initialize: function(options) {
    App.View.Container.prototype.initialize.call(this,options);

    _.bindAll(this, '_loadDates');

    for (var i in options)
      this[i] = options[i];

    this.panelList = new App.Collection[App.Utils.capitalizeFirstLetter(this.id_category)].PanelList(null,options);

    this.category = this.scopeModel.get('categories').get(this.id_category);
  },

  events: {
    'change #indicatorsDate':'_changeDate'
  },

  render: function(){
    this.$el.html(this._template());

    var navBar = App.getNavBar();
    var listCollection =  new Backbone.Collection(this.panelList.toJSON());
    listCollection.get(this.id_panel).set('selected',true);

    var breadcrumb = [
      listCollection.toJSON(),
      {
        url: this.scopeModel.get('id') + '/' + this.id_category + '/dashboard',
        title : this.category.get('name')
      },
      {
        url: this.scopeModel.get('id') + '/dashboard',
        title : this.scopeModel.get('name')
      }
    ];

    navBar.set({
      visible : true,
      breadcrumb : breadcrumb,
      scopeInfo: App.Utils.toDeepJSON(this.scopeModel),
      cities:[],
      section: this.id_category,
      scopeLoaded: this.scopeModel.get('id'),
      menu: { showable : true}
    });

    var dates = new Backbone.Model();
    dates.url = App.config.api_url + '/' + this.scopeModel.get('id') +'/' + this.category.get('id') + '/indicators/periods';
    dates.fetch({success:this._loadDates});

  },

  customRender: function(){

  },

  _loadDates:function(data){
    var options = '';
    _.each(data.get('value'),function(v,i) {
      data.get('value');
      options += '<option ' + (i == data.get('value').length-1 ? 'selected':'') + ' value="' + moment(v,'YYYYMM').format('YYYY-MM-DD') + '">' + moment(v,'YYYYMM').toDate().toLocaleString(App.lang,{month: 'long',year: 'numeric'}) + '</option>'
    });
    this.$('#indicatorsDate').html(options);
    this._renderWidgets();
  },

  _changeDate:function(e){
    var currentDate = this.$('#indicatorsDate').val();
    this._tableView.dataCollection.options.data.time.start = this.$('#indicatorsDate').val();
    this._gaugeView.widgetModel.set('date',currentDate);

    // this._tableView.render();
    //ES UN HACK PARA QUE AL CAMBIAR EL SELECTOR DE FECHA EL BOTÓNS DE DESCARGAR CSV SIGA FUNCIONANDO
    //LA INSTRUCCIÓN BUENA DEBERÍA SER LA DE ARRIBA COMENTADA
    this._tableView.subviews[0].render();
    this._gaugeView.render();
  },

  _renderWidgets:function(){
    var currentDate = this.$('#indicatorsDate').val();

    this._tableView = new App.View.Widgets.IndicadorTable({
      id_scope: this.scopeModel.get('id'),
      date: currentDate,
      title: this.table_title,
      id_category: this.id_category
    });

    this._gaugeView = new App.View.Widgets.IndicadorGauge({
      id_scope: this.scopeModel.get('id'),
      date: currentDate,
      var_id: this.var_id,
      timeMode: null,
      id_category: this.id_category,
    });

    this.$('.widgets').html(this._tableView.render().$el);
    this.$('.widgets').append(this._gaugeView.render().$el);

    $($('.widgets >div')[0]).addClass('col-lg-8');
    $($('.widgets >div')[1]).addClass('col-lg-4');

    this.subviews.push(this._tableView);
    this.subviews.push(this._gaugeView);
  }


});
