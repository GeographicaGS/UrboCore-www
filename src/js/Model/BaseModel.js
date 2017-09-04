App.Model.Base = Backbone.Model.extend({
  initialize: function(options) {
    this.options = options;
  },
  fetch: function(options) {
    options.contentType='application/json';
    return Backbone.Model.prototype.fetch.call(this, options);
  }
});

App.Model.Post = App.Model.Base.extend({
  fetch: function(options) {
    options.type='POST';
    if (options.data)
      options.data = JSON.stringify(options.data);

    return App.Model.Base.prototype.fetch.call(this, options);
  }
});


App.Model.Put = App.Model.Base.extend({
  url: function(){
    return this.options.url;
  },
  fetch: function(options) {
    options.type='PUT';
    if (options.data)
      options.data = JSON.stringify(options.data);

    return App.Model.Base.prototype.fetch.call(this, options);
  }
});

App.Model.Widgets.Base = Backbone.Model.extend({
  defaults: {
    link: null,
    timeMode: null,
    infoTemplate: null,
    // Probably category will be deprectaed
    category: null,
    title: null,
    // refreshTime in seconds. If timeMode='now' and refreshTime=null refreshTime will be set to 30s
    refreshTime : 60 * 1000,
  }
});

App.Model.PublishedWidget = App.Model.Post.extend({
  defaults: {
    b: '',
    name: '',
    description: null,
    widget: '',
    scope: '',
    payload: []
  },
  url: function(){
    return App.config.api_url + '/' + App.currentScope + '/auth/widget/';
  }
})