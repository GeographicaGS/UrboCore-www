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
