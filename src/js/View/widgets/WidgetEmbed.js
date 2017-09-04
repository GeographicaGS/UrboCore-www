'use strict';

App.View.Widgets.Embed = App.View.Container.extend({

  initialize: function(options){
    _.bindAll(this,'_fetchedMetadata');

    options = _.defaults(options,{
      embed: true
    });
    App.View.Container.prototype.initialize.call(this,options);

    var classname = options.classname,
      namespace = classname.split('.').slice(1),
      obj = App;

    for (var i in namespace)
      obj = obj[namespace[i]];

    this.options = options;
    this._class = obj;

  },

  _fetchedMetadata: function(){
    this.subviews[0] = new this._class(this.options);
    this.$el.html(this.subviews[0].render().el);

  },

  render: function(){
    this._fetchedMetadata();
    return this;
  }

});
