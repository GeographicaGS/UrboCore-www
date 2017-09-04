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
