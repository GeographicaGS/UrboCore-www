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
 * A view to show a devices list to choose next the device name into
 * the device view
 */
App.View.DeviceList = Backbone.View.extend({
  //Old default template
  //_template: _.template($('#devices-device_list_template').html()),

  //Device list filter placeholder templates
  _template: _.template($('#devices-device_list_filtered_template').html()),
  _list_template: _.template($('#devices-device_list_filtered_itemlist_template').html()),
  //End Device list filter placeholder templates

  _state: {
    term: '',
  },

  initialize: function (options) {
    //Filter is ON by default
    this.options = _.defaults(options, {
      withFilter: true
    });

    //There is no need for template overriding
    // if (options.template) {
    //   this._template = options.template;
    // }

    // Collection with the data to show
    this._collection = new Backbone.Collection();
    this._collection.url = App.config.api_url + '/' + this.model.get('scope') + '/entities/' + this.model.get('entity') + '/elements';
    this.listenTo(this._collection, 'reset', this.render);
    this._collection.fetch({ 'reset': true });
  },

  //Device list filter placeholder events
  events: {
    'keyup #filter': 'onChangeFilter'
  },
  //End


  onClose: function () {
    this.stopListening();
  },

  // Device list filter placeholder methods
  onChangeFilter: function(event){
    var term = event.target.value.trim();
    var elements = this._collection.toJSON();

    //If there is no need to refilter the list
    if (this._state.ter === term) {
        return;
    }
    
    //Update state
    this._state.term = term;

    //By default, if filter is empty or the term is not long enough
    if(term === '' || term.length < 1){
       return this.clearList(elements);
    }
    //Filter the list
    elements = _.filter(elements, function(element){
        return element.id.toLowerCase().indexOf(term.toLowerCase()) >= 0;
    });

    //Render the new list
    this.customListRender(elements);

},

clearList: function(elements){
  this.customListRender(elements);
},

customListRender: function ( elements ) {
  this.$('#list-wrapper').html(this._list_template({
      term: this._state.term,
      elements: elements,
      m: this.model.toJSON()
  }));
},
//End device list placeholder methodsç


//Old render method
// render: function () {
//   this.$el.html(this._template({
//     elements: this._collection.toJSON(),
//     m: this.model.toJSON() 
//   }));
//   return this;
// },

//Devilce list filter placeholder render
render: function () {
  this.$el.html(this._template({
      withFilter: this.options.withFilter
  }));
  this.customListRender( this._collection.toJSON() );

  return this;
}

});
