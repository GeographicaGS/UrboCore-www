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
 * Backbone.View that show a form to create or edit 'scopes'
 * inside the Admin's routes
 */
App.View.Admin.ScopeCreate = App.View.FormView.extend({

  // View's Params

  template: _.template($('#admin-scope_create_template').html()),
  events: {
    'change input[name=multi]': 'toggleMultiScope',
    'click .cancelButton': 'onCancelButton',
    'submit form': 'onSubmitButton',
  },

  // View's Funcions

  initialize: function(options) {
    this.options = options || {};
    App.View.FormView.prototype.initialize.call(this, { model: new App.Model.Scope() });
  },

  /**
   * Draw the template into the DOM
   * 
   * @return {Object} this - to chain other 'render' functions
   */
  render: function() {
    this.$el.html(this.template({ parentScope: this.options.parentScope || null }));
    return this;
  },

  /**
   * To change the form's DOM elements about 'multiscope'
   * 
   * @param {Object} e - triggered event
   */
  toggleMultiScope: function(e) {
    e.preventDefault();
    if (e.currentTarget.checked) {
      this.$('.noMulti').addClass('hide');
    } else {
      this.$('.noMulti').removeClass('hide');
    }
  },

  /**
   * Cancel and close edit form
   * 
   * @param {Object} e 
   */
  onCancelButton: function(e) {
    e.preventDefault();
    this.trigger('form:cancel', null);
  },

  /**
   * Submit the form and create or edit a scope
   *
   * @param {Object} e 
   */
  onSubmitButton: function(e) {
    e.preventDefault();

    var dataForm = this.convertFormToJSON(e.currentTarget);

    // Clean server error
    this.toggleServerError(false, null);

    // we parse some data in dataForm
    dataForm.multi = Boolean(dataForm.multi);
    dataForm.location[0] = dataForm.location[0].replace(',', '.');
    dataForm.location[1] = dataForm.location[1].replace(',', '.');

    // Other data to model
    if (this.options.parentScope) {
      dataForm.parent_id = this.options.parentScope;
    }

    // validate data
    this.model.set(dataForm);
    if (this.model.isValid()) {
      this.createScope(dataForm);
    } else {
      this.showErrors();
    }
  },

  /**
   * Create a new 'scope' in database
   * 
   * @param {Object} data - scope data
   */
  createScope(data) {
    var _this = this;
    App.mv().createScope(data, {
      success: function(newScope) {
        _this.trigger('form:save', { data: newScope });
      },
      error: function() {
        _this.toggleServerError(true, __('Hubo un error al intentar crear el ámbito'));
      }
    });
  },

  /**
   * Show the server error in DOM
   *
   * @param {Boolean} showError - ¿show error?
   * @param {String} msg -  error message
   */
  toggleServerError(showError, msg) {
    var serverError = this.$('#server-error');
    
    if(serverError) {
      if (showError) {
        $(serverError).removeClass('hide');
        $(serverError).html(msg);
      } else {
        $(serverError).addClass('hide');
      }
    }
  }
});
