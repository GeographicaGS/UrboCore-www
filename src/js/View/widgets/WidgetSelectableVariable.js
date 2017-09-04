'use strict';

App.View.Widgets.SelectableVariable = App.View.Widgets.Base.extend({
  _template: _.template( $('#widgets-widget_selectableVariable_template').html() ),

  // TODO: Refactor Widget.Base to allow extending config
  initialize: function(options){
    this.options = options;

    this.model = new App.Model.Widgets.Base({
      title: this.options.title,
      link: this.options.link,
      titleLink: this.options.titleLink||null,
      infoTemplate: this.options.infoTemplate,
      timeMode: this.options.timeMode,
      refreshTime: this.options.refreshTime,
      dimension: this.options.dimension||'',
      type: this.options.type||'',
      selectableVariables: this.options.selectableVariables || [],
      exportable : this.options.exportable || false,
      publishable: this.options.publishable || false,
      classname: this.options.classname || '',
      embed: this.options.embed || false,
      permissions: this.options.permissions || {}
    });

    this.model.set('currentVariable',options.selectableVariables[0] ? options.selectableVariables[0].id : '');

    // Set a default refresh time for now widgets.
    // if (!this.model.get('refreshTime') && this.model.get('timeMode')=='now')
    //   this.model.set('refreshTime',60*1000);

    // this.listenTo(App.ctx,"change:bbox",this.refresh);
    if (this.model.get('timeMode') == 'historic')
      this.listenTo(App.ctx,"change:start change:finish",this.refresh);

    this.listenTo(App.ctx,"change:bbox",this.refresh)

    if (this.model.get('refreshTime')){
      this._setRefreshInterval()
    }

    this.subviews = [];
    this.filterables = [];

    this.filterModel = App.getFilter(this.options.id_category);
    if (this.filterModel)
      this.listenTo(this.filterModel,'change',this._onChangeFilter);

    _.bindAll(this, '_drawContent');

    this._drawContent();
  },


  events: _.extend({
    'click .popup_widget.variableSelector .varsel li': '_changeVar'
  }, App.View.Widgets.Base.prototype.events),

  _changeVar: function(e){
    var $target = $(e.currentTarget);
    this.model.set('currentVariable', $target.data('varid'));

    this.$('.popup_widget.variableSelector > span').html($target.html());
    this.$('.popup_widget.variableSelector .selected').removeClass('selected');
    $target.addClass('selected');

    this._drawContent();
    this.refresh();
  },

  _drawContent: function(){
    throw new Error('_drawContent not implemented');
  }
});
