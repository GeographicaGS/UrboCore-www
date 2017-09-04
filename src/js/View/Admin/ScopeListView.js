'use strict';

App.View.Admin.ScopeList = Backbone.View.extend({
  _template: _.template( $('#admin-scope_list_template').html() ),

  events: {
    'click .newScope': '_createScope',
    'click .link': '_gotoScope',
    'click .remove': '_removeScope'
  },

  initialize: function(){
    this.collection = new App.Collection.Metadata.Scope();
    this.listenTo(this.collection, 'reset', this.render);
    this.collection.fetch({reset: true});
    // this.collection = App.mv()._metadataCollection;
    // this.render();
  },

  render: function(){
    App.getNavBar().set({
      visible : false
    });

    this.$el.html(this._template({ scopes: App.Utils.toDeepJSON(this.collection) }));

    return this;
  },

  _createScope: function(e) {
    e.preventDefault();

    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    var createScopeView = new App.View.Admin.ScopeCreate();
    this._popUpView.internalView = createScopeView;

    this.$el.append(this._popUpView.render().$el);

    this.listenTo(createScopeView, 'close', this._onCreateScopeClosed);

    this._popUpView.show();
  },

  _onCreateScopeClosed: function(e){
    this._popUpView.closePopUp();
    if(e.data && e.data.id){
      this.collection.fetch({success: function(){
        App.router.navigate('/admin/scope/' + e.data.id, {trigger: true});
      }});
    }else{
      this.collection.fetch({reset: true});
    }
  },

  _gotoScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope'] ? e.currentTarget.attributes['data-scope'].value : '';
    if(scopeId){
      App.router.navigate('/admin/scope/' + scopeId, {trigger: true});
    }
  },

  _removeScope: function(e){
    e.preventDefault();
    var scopeId = e.currentTarget.attributes['data-scope'] ? e.currentTarget.attributes['data-scope'].value : '';
    if(scopeId){
      if(window.confirm(__('¿Estás seguro de eliminar este ámbito?\nSe perderán todas las configuraciones de este ámbito.'))){
        var _this = this;
        App.mv().removeScope(scopeId, function(){ _this.collection.fetch({reset: true}); });
      }
    }
  }

});
