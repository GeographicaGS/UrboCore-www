// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

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
