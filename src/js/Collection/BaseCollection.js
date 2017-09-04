App.Collection.Base = Backbone.Collection.extend({
  initialize: function(models,options){
    this.options = options;
  }
});

App.Collection.Post = App.Collection.Base.extend({
  fetch: function(options) {
    options.type='POST';
    options.contentType='application/json';

    // TODO: Fix Timeserie doesn't refresh BBox
    // var params = options.data || this.options.data;
    // if(typeof params.filters == "undefined"){ params.data.filters = {}; }
    //
    // if(App.ctx.get('bbox_status') && App.ctx.get('bbox')){
    //   params.filters.bbox = App.ctx.get('bbox');
    // }
    // options.data=JSON.stringify(params);

    options.data = JSON.stringify(_.defaults(options.data, this.options.data));
    // options.data = JSON.stringify(options.data || this.options.data);

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});


App.Collection.PublishedWidget = App.Collection.Base.extend({
  model: App.Model.PublishedWidget
});
