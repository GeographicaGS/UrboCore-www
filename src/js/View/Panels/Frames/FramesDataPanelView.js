'use strict';

App.View.Panels.Frames.Data = App.View.Panels.Map.extend({
  _templateFrame: _.template('<iframe width="100%" height="100%" frameborder="0" src="<%= url %>" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>'),

  initialize: function(options) {
    var options = _.defaults(options, {
      id_category: 'frames',
      spatialFilter: false,
      master: false,
      title: __('Índice'),
      id_panel: 'master',
      filterView: false,
      dateView: false
    });
    App.View.Panels.Map.prototype.initialize.call(this,options);

    this.framesCol = new App.Collection.Frames.ScopeFrames([], {
      scope: this.scopeModel.id
    });
    this.listenTo(this.framesCol, 'reset', this.renderNavBar);
    this.framesCol.fetch({reset: true});
  },

  renderNavBar: function() {
    var _this = this;
    this.framesCol.each(function (elem, idx) {
      _this.panelList.add({
        id: elem.id,
        title: elem.get('title'),
        url: '/' + _this.scopeModel.get('id') + '/' + _this.id_category + '/' + elem.id
      });
    });
    this.id_panel = this.frameId;
    this.render();

    this.frameModel = new App.Model.Frame({id: this.frameId, scope: this.scopeModel.id});
    this.frameModel.fetch({ success: this.renderIframe.bind(this) });
  },

  renderIframe: function(){
    this.$el.html(this._templateFrame(this.frameModel.toJSON()));
  }

});
