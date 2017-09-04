App.Collection.Frames.ScopeFrames = App.Collection.Base.extend({
  url: function () {
    return App.config.api_url + '/' + this.options.scope + '/frames/';
  }
});

App.Collection.Frames.PanelList = Backbone.Collection.extend({
  initialize: function (models, options) {
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    this.set([
      {
        id: 'master',
        title: __('Índice'),
        url: base + '/dashboard'
      }
    ]);
  }
});
