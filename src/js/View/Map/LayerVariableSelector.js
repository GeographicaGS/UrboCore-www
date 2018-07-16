// Copyright 2018 Telefónica Digital España S.L.
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

App.View.Map.VariableSelector = Backbone.View.extend({
  
    events: {
      'click .variableselector': 'toggle',
      'click .option': 'changeVariable'
    },
  
    initialize: function(options) {
      options = _.defaults(options, {
        variables: []
      })
      this.options = options;
      this._template = _.template($("#map-variable_selector").html());
    
    },
  
    render: function() {
      this.$el[0].id = 'variableselector';
      this.$el.append(this._template({'variables': this.options.variables}));
      return this;
    },
  
    changeVariable: function(e) {
      this.$el.find('.selected').html(e.target.innerText);
      this.$el.find('.option').removeClass('choosen');
      e.target.classList.toggle('choosen');
      this.options.filterModel.set('variable',e.target.getAttribute('data-item-value'));
    },

    toggle: function(e) {
      this.$el.find('.options').toggleClass('showing');
    }  
  });
