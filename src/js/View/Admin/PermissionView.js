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

App.View.Admin.PermissionPopup = Backbone.View.extend({
  _template: _.template( $('#admin-permission_template').html() ),
  _user_template: _.template( $('#admin-permission_user_template').html() ),

  events: {
    'click .button.add': '_addUser',
    'click .button.remove': '_removeUser',
    'click .button.save': '_saveAndExit',
    'click .button.cancel': '_cancelAndExit',
    'keyup input.search': '_filterUsers'
  },

  initialize: function(options){
    this.options = {
			id_scope: options.id_scope || '',
			id_resource: options.id_resource,
      type_resource: options.type_resource || '',
      name_resource: options.name_resource || '',
		};

    this.usersCol = new App.Collection.User();
    this.listenTo(this.usersCol, 'reset', this._onUsersLoaded);
    this.usersCol.fetch({reset: true});
    this.changes = {
      add: [],
      rm: []
    }
  },

  render: function(){
    this.setElement(this._template({
      type: this.options.type_resource,
      name: this.options.name_resource
    }));
    this.$list = this.$('.scrollableList');
    return this;
  },

  _renderList: function(customCol){
    this.$list.empty();
    var users = customCol || this.usersCol;
    var _this = this;
    users.each(function(el){
      _this.$list.append(_this._user_template({
        user: el.toJSON(),
        added: _this.permissionsCol.get(el.get('id')) !== undefined
      }));
    });
  },

  _onPermissionsLoaded: function(){
    this._renderList();
  },

  _onUsersLoaded: function(){
    this.permissionsCol = new App.Collection.Metadata.ResourcePermission([], this.options);
    this.listenTo(this.permissionsCol, 'reset', this._onPermissionsLoaded);
    this.permissionsCol.fetch({reset: true});
  },

  _addUser: function(e){
    e.preventDefault();
    var $el = $(e.currentTarget);
    var selectedUser = $el.parent().data('user');
    var userIdx = this.changes.rm.indexOf(selectedUser);
    if(userIdx === -1){
      this.changes.add.push($(e.currentTarget).parent().data('user'));
      $el.parent().toggleClass('added');
    }else{
      this.changes.rm.splice(userIdx,1);
    }
  },

  _removeUser: function(e){
    e.preventDefault();
    var $el = $(e.currentTarget);
    if(!$el.hasClass('blocked')){
      var selectedUser = $el.parent().data('user');
      var userIdx = this.changes.add.indexOf(selectedUser);
      if(userIdx === -1){
        this.changes.rm.push($(e.currentTarget).parent().data('user'));
      }else{
        this.changes.add.splice(userIdx,1);
      }
      $el.parent().toggleClass('added');
    }else{
      console.log("No se puede borrar a " + $el.parent().data('user'));
    }
  },

  _saveAndExit: function(e){
    e.preventDefault();
    // Save
    var _this = this;
    this.permissionsCol.save(this.changes, {
      success: function(){
        _this.trigger('close', {});
      },
      failure: function(error){
        console.log('Error: ' + error);
      }
    });
  },

  _cancelAndExit: function(e){
    e.preventDefault();
    this.trigger('close', {});
  },

  _filterUsers: function(e){
    this._renderList(this.usersCol.search(e.currentTarget.value));
  }
});
