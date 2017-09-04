'use strict';

App.View.SubHeader = Backbone.View.extend({
  _template: _.template( $('#subheader_template').html() ),
  className:'subheaderbar',

  initialize: function(options) {
    this.listenTo(this.model,'change',this.render);
    this.render();
  },

  events: {
    'click a':'_back'
  },

  _back : function(e){
    e.preventDefault();
    App.router.navigate(this.model.get('backurl'),{trigger: true})

  },
  onClose: function(){
    this.stopListening();        
  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON()}));
    return this;
  }

});
