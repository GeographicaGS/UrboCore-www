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

App.View.UserList = Backbone.View.extend({

  _template: _.template( $('#user-user_list_template').html() ),

  events: {
   "mouseover .userElementList" : "_createsEditAndDelete",
   "click .editUserElementList" : "_editUser",
   "click .newUser" : "_newUser",
   "click .changePassword" : "_changePassword",
   "click .userElementList" : "_seeUserInfo"
  },

  _createsEditAndDelete: function(user) {
    var userElement = $(user.currentTarget);
    $(".containerEditAndDelete").hide();
    userElement.find(".containerEditAndDelete").show();
  },

  _editUser: function(element) {
    element.stopPropagation();
    var identificador = $(element.currentTarget).parent().attr("id");
    this.editUser(identificador);
  },

  editUser: function(identificador) {
    var userModel = this.users.get(identificador);

    var userView = new App.View.User({model : userModel});

    //Pasamos la referencia de la coleccion para actualizar la informacion
    //en la lista cuando se edite
    userView.collectionUser = this.users;

    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userView;
    //Pasamos la vista del popup a la nueva vista interna para que esta sea capaz de cerrar el popup completamente
    userView.popUpView = this._popUpView;
    this.$el.append(this._popUpView.render().$el);

    this.$el.find(".modal .header").html(__("Editar ficha de usuario"));
    this.$el.find("#user_form form button[type='submit']").html(__("GUARDAR CAMBIOS"));
    this.$el.find("#user_form .changePasswordQuestion").show();
    this.$el.find("#user_form .changePasswordInputs").hide();
    if(App.auth.getUser().superadmin) {
      this.$el.find("#user_form .changePasswordInputs .oldPassword").hide();
      this.$el.find("#user_form .deleteButton button").show();
    } else {
      this.$el.find("#user_form .changePasswordInputs .oldPassword").show();
      this.$el.find("#user_form .deleteButton button").hide();
    }

    this._popUpView.show();
  },

  _changePassword: function() {
    this.$el.find("#user_form .changePasswordInputs").toggle();
  },

  _seeUserInfo: function(element) {
    var identificador = $(element.currentTarget).attr("id");
    var userModel = this.users.get(identificador);

    var userInfoView = new App.View.UserInfo({model : userModel});
    userInfoView.userListView = this;
    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userInfoView;
    this.$el.append(this._popUpView.render().$el);
    this._popUpView.show();

    this.$el.find(".modal .header").html(__("Ficha de usuario"));
  },

  _newUser: function(element) {
    var userModel = new App.Model.User();

    var userView = new App.View.User({model : userModel});

    //Pasamos la referencia de la coleccion para actualizar la informacion
    //en la lista cuando se edite
    userView.collectionUser = this.users;
    userView.newUser = true;
    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userView;
    userView.popUpView = this._popUpView;
    this.$el.append(this._popUpView.render().$el);

    this.$el.find(".modal .header").html(__("Nuevo usuario"));
    this.$el.find("#user_form form button[type='submit']").html(__("CREAR USUARIO"));
    this.$el.find("#user_form .changePasswordQuestion").hide();
    this.$el.find("#user_form .changePasswordInputs").show();
    this.$el.find("#user_form .changePasswordInputs .oldPassword").hide();
    this.$el.find("#user_form .deleteButton button").hide();

    this._popUpView.show();
  },

  initialize: function(options) {
    this.users = new App.Collection.User();
    this.listenTo(this.users,"reset",this._onCollectionFetched);
    this.users.fetch({"reset": true});
    App.getNavBar().set({
      visible : false
    });

    this.render();
  },

  onClose: function(){
    this.stopListening();

    if(this._popUpView != undefined) {
      this._popUpView.close();
    }
  },

  render: function(){
    this.$el.html(this._template({'users':null}));
    this.$('.title_page').append(App.circleLoading());
    return this;
  },

  _onCollectionFetched:function(){
    this.$el.find("#user_list").html(this._template({
      'users':this.users.toJSON()
    }));
  }

});
