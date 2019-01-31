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

/**
 * Backbone.View with common functions to deal with forms
 */
App.View.FormView = Backbone.View.extend({

  // View's Params

  model: null,

  // View's Funcions

  initialize: function(options) {
    this.options = options || {};
    if (this.options.model) {
      this.model = new App.Model.Scope();
    }
  },

  /**
   * Convert the form's data into a JSON
   *
   * @param {*} form - form to JSON
   * @return {Object} form data in JSON
   */
  convertFormToJSON(form) {
    return $(form).serializeArray()
      .reduce((formDataObject, currentData) => {
        // We looking for arrays like that --> 'name[]'
        var resultRegex = (/(\w*)\[\]/ig).exec(currentData.name);

        if (resultRegex !== null) { // Is array
          if (Boolean(formDataObject[resultRegex[1]]) === false) { // Array doesn't exists
            formDataObject[resultRegex[1]] = [];
          }
          formDataObject[resultRegex[1]].push(currentData.value || '');
        } else {
          formDataObject[currentData.name] = currentData.value || '';
        }
        return formDataObject;
      }, {});
  },

  /**
   * Show errors in DOM
   */
  showErrors: function () {
    this.hideErrors();

    var errors = this.model.validationError;

    if(errors && errors.length > 0) {
      errors.forEach(function(error) {
        var query = Array.isArray(this.model.attributes[error.name])
          ? error.name + '[]'
          : error.name;
        var currentHelpBlock = this.$('[name="' + query + '"] + .help-block');

        if(currentHelpBlock.length > 0) {
          $(currentHelpBlock[0]).html(error.msg);
          $(currentHelpBlock[0]).addClass('has-error');
          $(currentHelpBlock[0]).removeClass('hide');
        }
      }.bind(this));
    }
  },

  /**
   * Hide form errors in DOM
   */
  hideErrors: function () {
    var errorMessages =
      this.$('input:not(:disabled) + .help-block, select:not(:disabled) + .help-block, textarea:not(:disabled) + .help-block');

    $(errorMessages).each(function(index) {
      $(errorMessages[index]).html('');
      $(errorMessages[index]).removeClass('has-error');
      $(errorMessages[index]).addClass('hide');
    });
  }
});
