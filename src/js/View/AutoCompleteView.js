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
 * To show an autocomplete search to find into a list (collection)
 * 
 * To Know:
 * 
 * 1. Params to use with the View:
 * 
 * - 'collection' (Backbone.Collection) to get the data to show in the list (required)
 * 
 * 2. Each collection item must have at leat "id" and "name", the other
 * item parameters will be drawing into the li element like a "data" attribute
 */
App.View.AutoComplete = Backbone.View.extend({
  _template: _.template($('#autocomplete_template').html()),
  _template_list: _.template($('#autocomplete_list_template').html()),

  initialize: function (options) {
    if (options.collection) {
      this._collection = options.collection;
      this.listenTo(this._collection, 'reset', this._collectionReset);
      _.bindAll(this, '_updateTerm');
    } else {
      console.log('App.View.AutoComplete is required a collection');
    }
  },

  events: {
    'keyup #autocomplete-term': '_updateTerm',
    'click #autocomplete-list li': '_selectTerm',
    'click #autocomplete-clear': '_clearSearch'
  },

  render: function () {
    this.$el.html(this._template());
    return this;
  },

  /**
   * When the query (terms) is updated, the collection
   * is reseted
   * 
   *  @param {Object} event - event triggered
   */
  _updateTerm: _.debounce(function (event) {
    var currentTerm = $(event.currentTarget).val();

    if (currentTerm.length > 0) {
      this._collection.fetch({ 
        reset: true,
        term: currentTerm
      });
      this.$('#autocomplete').addClass('searching');
      this.$('.loading').remove();
      this.$('#autocomplete').append(App.circleLoading());
    } else {
      this.$('##autocomplete-clear').trigger('click');
    }
  }, 500),

  /**
   * Launched when the collection is reset
   */
  _collectionReset: function () {
    this.$('.loading').remove();
    this.$('#autocomplete-list').html(
      this._template_list({ elements: this._collection.toJSON() })
    );

    if (this._collection.toJSON().length > 0) {
      this.$('#autocomplete-list').addClass('active');
    } else {
      this.$('#autocomplete-list').removeClass('active');
    }
  },

  /**
   * Launched when the user select one option
   * 
   * @param {Object} event - triggered event
   */
  _selectTerm: function (event) {
    debugger;
    this.$('#autocomplete').addClass('searching');
    this.$('#autocomplete-term').val($(event.currentTarget).text());
    this.$('#autocomplete-list').removeClass('active');

    var selectedElement = this._collection.findWhere({
      id: $(event.currentTarget).data('id')
    });

    this.trigger('autocomplete:selected', selectedElement);
  },

  /**
   * When clear the search
   * 
   * @param event event triggered
   */
  _clearSearch: function (event) {
    this.$('#autocomplete-list').removeClass('active');
    this.$('.loading').remove();
    this.$('#autocomplete-term').val('');
    this.$('#autocomplete').removeClass('searching');
    this.trigger('autocomplete:clear', null);
  },

  /**
   * Callback triggered when the view is closed
   */
  onClose: function () {
    this.stopListening();
  },

});
