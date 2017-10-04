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

App.Model.User = Backbone.Model.extend({

  defaults: {
    name : "",
    surname : "",
    email : "",
    password : "",
    password2 : "",
    scopes : [],
    ldap: false,
    superadmin: false
  },

  urlRoot: function(){
    return App.config.api_url + '/users';
  },

  validators: {
    name: {
      required: {
        msg: 'El nombre no puede estar vacío'
      }
    },

    email: {
      required: {
        msg: 'El email no puede estar vacío'
      },
      pattern: {
        pattern: /^([\w.\d]+)@((\w)+\.)+(\w)+$/,
        msg: 'El formato del mensaje es incorrecto'
      }
    }
  },

  validateOne: function(name, value) {
    var errors = [];
    var validators = this.validators;
    if(validators[name] != undefined) {
      if (validators[name].required && !$.trim(value)) {
        errors.push(validators[name].required.msg);
      } else if(validators[name].pattern && !validators[name].pattern.pattern.test(value)) {
        errors.push(validators[name].pattern.msg);
      }
    }
    return errors;
  },

  validate: function(attributes) {
    var errors = {};
    _.each(attributes, function(name, value) {
      //Validacion generica
      var errorResult = this.validateOne(value, name);
      if(errorResult.length != 0) {
        errors[value] = errorResult;
      }
      //Validacion especifica
      if(value == 'password' && $.trim(value)) {
        var password2Value = attributes.password2;
        if(name != password2Value) {
          if(errors[value] == undefined) {errors[value] = []};
          errors[value].push("Las contraseñas no coinciden");
        }
      }
    }, this);
    if(_.isEmpty(errors)) {
      return undefined;
    } else {
      return errors;
    }
  }
});
