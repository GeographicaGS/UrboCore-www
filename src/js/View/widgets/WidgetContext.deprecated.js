'use strict';

App.View.Widgets.Deprecated.Context = Backbone.View.extend({

  initialize: function(options) {
    this.model = options.m;
    var _onChangeContext = this._onChangeContext;
    var _view = this;
    if(this.model != undefined) {
      _onChangeContext = this.model.get("onChangeContext");
      var _view = this.model.get("view");
    }

    this.ctxModel = App.ctx;
    _view.listenTo(this.ctxModel,"change:start change:finish change:bbox",_onChangeContext);
  },

  _onChangeContext: function() {
  	if(this.model && this.model.url)
    	this.model.fetch();
    if(this.collection)
    	this.collection.fetch({'reset':true});
  },

  onClose: function(){
    this.stopListening();
  }
});
