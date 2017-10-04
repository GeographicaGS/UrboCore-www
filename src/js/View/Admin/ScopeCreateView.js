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

App.View.Admin.ScopeCreate = Backbone.View.extend({
  _template: _.template( $('#admin-scope_create_template').html() ),

  events: {
    'change input[name=isMultiScope]': '_toggleMultiScope',
    'click .exitButton': '_cancel',
    'submit form': '_submit',
  },

  initialize: function(options){
    this.options = options || {};
    this.render();
  },

  render: function(){
    this.$el.html(this._template({parentScope: this.options.parentScope || null}));
    return this;
  },

  _toggleMultiScope: function(e){
    e.preventDefault();
    if(e.currentTarget.checked){
      this.$('.noMulti input, .noMulti label').attr('disabled', 'disabled').removeAttr('required');
    }else{
      this.$('.noMulti input, .noMulti label').removeAttr('disabled').attr('required', 'required');
    }
  },

  _cancel: function(e){
    e.preventDefault();
    this.trigger('close', {});
  },

  _submit: function(e){
    e.preventDefault();

    // TODO: Save element
    var data = {
      name: e.currentTarget.name.value,
      multi: e.currentTarget.isMultiScope ? e.currentTarget.isMultiScope.checked:false
    };
    if(!data.multi){
      data.location = [
        parseFloat(e.currentTarget.lat.value),
        parseFloat(e.currentTarget.lon.value)
      ];
      data.zoom = parseInt(e.currentTarget.zoom.value);
      // data.db = e.currentTarget.db.value;
    }

    if(this.options.parentScope){
      data.parent_id = this.options.parentScope;
    }

    var _this = this;
    App.mv().createScope(data, {
      success: function(newScope){
        _this.trigger('close', {data: newScope});
      },
      error: function(){
        console.log('Error!');
      }
    })
  },
});
