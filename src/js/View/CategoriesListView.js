  'use strict';

App.View.CategoriesList = Backbone.View.extend({
  _template: _.template( $('#categories_list_template').html() ),

  initialize: function(options) {
    this.scope = this.model.get('scope');
    this.categories = this.model.get('categories');
    this.scopeModel = App.mv().getScope(this.scope);

    var breadcrumb = [
      {
        url: this.scopeModel.get('id') + '/categories/welcome',
        title : __('Verticales')
      },
      {
        url: this.scopeModel.get('id') + '/categories/welcome',
        title : this.scopeModel.get('name')
      }
    ];



    App.getNavBar().set({
      visible : true,
      backurl: '',
      breadcrumb: breadcrumb,
      menu: {
        showable:false
      }
    });

    this.render();
  },

  events: {},

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({
      scope: this.scope,
      categories: App.Utils.toDeepJSON(this.categories)
    }));

    $('footer.footer .logos').empty();

    return this;
  }

});
