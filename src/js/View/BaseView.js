App.View.Container = Backbone.View.extend({
    initialize: function(){
      this.subviews = [];
    },
    onClose:function(){
      this.stopListening();
      for (var i in this.subviews)
        if (this.subviews[i])
          this.subviews[i].close();
    }
});

// This basic view simply renders a template
App.View.BasicView = Backbone.View.extend({
  initialize: function(options){
    this._template = _.template(options.template);
  },
  render: function(){
    this.setElement(this._template());
    return this;
  }
});
