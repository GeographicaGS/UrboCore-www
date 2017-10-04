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
