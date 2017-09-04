'use strict';

App.View.Panels.Frames.Master = App.View.Panels.Base.extend({
  _template: _.template( $('#frames_dashboard_template').html() ),

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'frames',
      spatialFilter: false,
      master: true,
      title: __('Índice'),
      id_panel: 'master',
      filterView: false
    });

    App.View.Panels.Base.prototype.initialize.call(this, options);

    this._widgets = [];

    this.framesCol = new App.Collection.Frames.ScopeFrames([], {
      scope: this.scopeModel.id
    });
    this.listenTo(this.framesCol, 'reset', this.renderFrames);
    this.listenTo(this.framesCol, 'update', this.refresh);
    this.framesCol.fetch({reset: true});
  },

  events: _.extend(
    {
      'click .createFrame': 'createFrame'
    },
    App.View.Panels.Base.prototype.events
  ),

  refresh: function () {
    while (this._widgets.length) {
      var subview = this._widgets.pop();
      subview.close();
    }
    while (this.subviews.length) {
      var subview = this.subviews.pop();
      subview.close();
    }

    this.framesCol.fetch({reset: true});
  },

  renderFrames: function () {
    var _this = this;

    this.framesCol.each(function (elem, idx) {
      _this._widgets.push(new App.View.Widgets.Frame.BaseFrame({
        link:  '/' + _this.scopeModel.get('id') + '/' + _this.id_category + '/' + elem.id,
        frameModel: elem
      }));
      _this.panelList.add({
        id: elem.id,
        title: elem.get('title'),
        url: '/' + _this.scopeModel.get('id') + '/' + _this.id_category + '/' + elem.id
      });
    });

    this.render();

    this.subviews.push(new App.View.Widgets.Container({
      disableMasonry:true,
      widgets: this._widgets,
      el: this.$('.widgets')
    }));
  },

  createFrame: function(e) {
    e.preventDefault();

    if(this._popupView == undefined) {
      var popupModel = new Backbone.Model({
        title: __('Nuevo frame')
      });
      this._popupView = new App.View.PopUp({
        model: popupModel
      });
    }

    var editView = new App.View.Widgets.Frame.FrameEdit({
      collection: this.framesCol
    });
    this._popupView.internalView = editView;

    this.$el.append(this._popupView.render().$el);

    this.listenTo(editView, 'close', this._onPopupClose);

    this._popupView.show();
  },

  _onPopupClose: function(e){
    this._popupView.closePopUp();
  }
});
