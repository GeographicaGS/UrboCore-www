App.Model.Frame = App.Model.Base.extend({
  urlRoot: function () {
    return App.config.api_url + '/' + this.options.scope + '/frames/';
  }
});
