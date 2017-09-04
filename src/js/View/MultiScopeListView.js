'use strict';

App.View.MultiScopeList = Backbone.View.extend({
  _template: _.template( $('#multi_scope_list_template').html() ),

  initialize: function(options) {

    this._scopeOptionSelected = 'todos';

    this.collectionScope = new App.Collection.MultiScope([], {multi : this._scopeOptionSelected});
    this.collectionScope.options.multi = this._scopeOptionSelected;
    this.listenTo(this.collectionScope,"reset",this._onCollectionFetched);
    this.collectionScope.fetch({"reset": true});
    App.getNavBar().set({
      visible : false
    });

    this.render();
  },

  events: {
    'click .popup_widget li' : '_changeScopeType',
  },

  _changeScopeType: function(element) {
    var data_scope = $(element.target).attr("data-scope");
    this._scopeOptionSelected = data_scope;
    this.collectionScope.options.multi = this._scopeOptionSelected;
    this.collectionScope.fetch({"reset": true});
    this.render();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({'multi_scopes':null, 'scopeOptionSelected':undefined}));
    this.$('.title_page').append(App.circleLoading());

    // WARNING: Temporary workaround to open menu when coming from Scope List
    window.sessionStorage.setItem('openMenu',true);

    return this;
  },

  _onCollectionFetched:function(){
     this.$el.html(this._template({
      'multi_scopes':this.collectionScope.toJSON(),
      'scopeOptionSelected':this._scopeOptionSelected
    }));
  }

});
