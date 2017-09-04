'use strict';

App.View.UserInfo = Backbone.View.extend({

  _template: _.template( $('#user-user_info_template').html() ),

  events: {
    "click .editUser" : "_editUser"
  },

  _editUser: function(element) {
    element.preventDefault();
    var identificador = $(element.currentTarget).parent().attr("id");
    this.userListView.editUser(identificador);
    this.close();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));
    return this;
  },

});
