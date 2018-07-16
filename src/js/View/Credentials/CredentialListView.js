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

App.View.CredentialList = Backbone.View.extend({

  _template: _.template( $('#credential-credential_list_template').html() ),

  events: {
   "mouseover .userElementList" : "_createsEditAndDelete",
   "click .userElementList" : "_editCredential",
   "click .newCredential" : "_newCredential",
  },

  _createsEditAndDelete: function(user) {
    var userElement = $(user.currentTarget);
    $(".containerEditAndDelete").hide();
    userElement.find(".containerEditAndDelete").show();
  },

  _editCredential: function(element) {
    element.stopPropagation();
    var identificador = $(element.currentTarget).attr("id");
    this.editCredential(identificador);
  },

  editCredential: function(identificador) {
    var userModel = this.credentials.get(identificador);
    var userView = new App.View.Credential({model : userModel});

    //Pasamos la referencia de la coleccion para actualizar la informacion
    //en la lista cuando se edite
    userView.collectionCredential = this.credentials;

    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userView;
    //Pasamos la vista del popup a la nueva vista interna para que esta sea capaz de cerrar el popup completamente
    userView.popUpView = this._popUpView;
    this.$el.append(this._popUpView.render().$el);

    this.$el.find(".modal .header").html(__("Editar credencial"));
    this.$el.find("#credential_form form button[type='submit']").html(__("GUARDAR CAMBIOS"));
    if(App.auth.getUser().superadmin) {
      this.$el.find("#credential_form .deleteButton button").show();
    } else {
      this.$el.find("#credential_form .deleteButton button").hide();
    }

    this._popUpView.show();
  },

  _changePassword: function() {
    this.$el.find("#credential_form .changePasswordInputs").toggle();
  },

  _seeCredentialInfo: function(element) {
    var identificador = $(element.currentTarget).attr("id");
    var userModel = this.credentials.get(identificador);

    var userInfoView = new App.View.CredentialInfo({model : userModel});
    userInfoView.userListView = this;
    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userInfoView;
    this.$el.append(this._popUpView.render().$el);
    this._popUpView.show();

    this.$el.find(".modal .header").html(__("Credencial"));
  },

  _newCredential: function(element) {
    var userModel = new App.Model.Credential();

    var userView = new App.View.Credential({model : userModel});

    //Pasamos la referencia de la coleccion para actualizar la informacion
    //en la lista cuando se edite
    userView.collectionCredential = this.credentials;
    userView.newCredential = true;
    if(this._popUpView == undefined) {
      this._popUpView = new App.View.PopUp();
    }
    this._popUpView.internalView = userView;
    userView.popUpView = this._popUpView;
    this.$el.append(this._popUpView.render().$el);

    this.$el.find(".modal .header").html(__("Nueva credencial"));
    this.$el.find("#credential_form form button[type='submit']").html(__("CREAR CREDENCIAL"));
    this.$el.find("#credential_form .deleteButton button").hide();

    this._popUpView.show();
  },

  initialize: function(options) {
    this.credentials = new App.Collection.Credential();
    this.credentials.fetch({"reset": true, "appendAuthorizationConnector": true, "success": this._onCollectionFetched.bind(this)});
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
    this.$el.html(this._template({'credentials':null}));
    this.$('.title_page').append(App.circleLoading());
    return this;
  },

  _onCollectionFetched:function(){
    this.$el.find("#user_list").html(this._template({
      'credentials':this.credentials.toJSON()
    }));
  }

});
