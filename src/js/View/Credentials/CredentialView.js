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

App.View.Credential = Backbone.View.extend({

  _template: _.template( $('#credential-new_credential_template').html() ),

  events: {
    'submit' : 'onFormSubmit',
    'focus input': function(e) {
        this.resetInputErrors(e.target);
    },
    'click .deleteButton button' : '_deleteCredential'
  },

  templates: {
    'error': _.template('<div class="error"><%=error%></div>')
  },

  initialize: function() {
    this.listenTo(this.model, 'invalid', this.onModelInvalid);
  },

  getInput: function(name) {
    return this.$el.find('[name="' + name + '"]');
  },

  onModelInvalid: function(model, errors) {
    var _this = this;
    _.each(errors, function(error, name) {
      _this.showInputErrors(_this.getInput(name), error);
    });
  },

  onFormSubmit: function(e) {
    e.preventDefault();
    var model = this.model;

    this.$el.find('input[name]').each(function() {
      if(this.value.trim()) {
        model.set(this.name, this.value);
      }
    });

    model.set('type', 'urbo-ctxbroker');
    model.set('created_at', moment());
    model.set('expires', moment(this.$el.find('input[name="expires"]').val(),'YYYY-MM-DD'));
    model.set('description', $("textarea#inputDescription").val());
    model.set('active', $("input[type='checkbox'].active").is(":checked"));


    var _thisView = this;

    if(this.model.isValid()) {
      this.model.save('', '', {
        success : function(model, response) {
          _thisView.collectionCredential.add(model);
          _thisView.collectionCredential.trigger("reset", _thisView.collectionCredential);
          _thisView.popUpView.closePopUp();
        },
        error : function(model, response) {
        }
      });
    }
  },

  _onInputChange: function(e) {
    this.model.set(e.target.name, e.target.value);
    var result = this.model.validateOne(e.target.name, e.target.value);
    if (result !== true) this.showInputErrors(e.target, result)
  },

  _resetAllInputErrors: function() {
    $("input.inputError").each(function() {
      $(this).removeClass("inputError");
      $(this).parent().find('.error').remove();
    })
  },

  resetInputErrors: function(target) {
    var $target = $(target);
    $target.removeClass('inputError');
    $target.parent().find('.error').remove();
  },

  showInputErrors: function(target, errors) {
    var $target = $(target);
    var errorsHTML = '';

    this.resetInputErrors(target);

    for (var i = 0; i < errors.length; i++) {
        errorsHTML += this.templates.error({error: errors[i]});
    }

    $target.addClass('inputError');
    $target.parent().append(errorsHTML);
  },

  _deleteCredential: function(e) {
    e.preventDefault();
    if (confirm('¿Estás seguro que deseas eliminar esta credencial?')) {
      var _thisView = this;
      this.model.destroy({
        success : function(model, response) {
          _thisView.collectionCredential.trigger("reset", _thisView.collectionCredential);
          _thisView.popUpView.closePopUp();
        },
        error : function(model, response) {
          _thisView._resetAllInputErrors();
        }
      });
    }
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));
    return this;
  },

});
