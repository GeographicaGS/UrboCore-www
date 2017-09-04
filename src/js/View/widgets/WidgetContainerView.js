'use strict';

App.View.Widgets.Container = Backbone.View.extend({
  initialize: function(options) {
    for (var i in options)
      this[i] = options[i];

    // Drop empty elements for widgets
    _.each(this.widgets, function(widget){
      if(!widget.hasPermissions())
        widget.close();
    });

    this.widgets = _.filter(this.widgets, function(widget){
      return widget.hasPermissions();
    });


    this.render();
  },

  onClose: function(){
    _.each(this.widgets,function(widget){
      widget.close();
    });
    this.stopListening();
  },

  render: function(){
    var _this = this;

    _.each(this.widgets,function(widget){
      _this.$el.append(widget.render().$el);
    });

    if(!this.disableMasonry){
      setTimeout(function(){
        _this.$el.masonry({
          gutter: 20,
          columnWidth: 360
        });
        _this.$('.widget').addClass('active');
      }, 1);
    }
  }
});
