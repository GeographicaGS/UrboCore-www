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

App.View.Widgets.VariableValue = App.View.Widgets.Deprecated.Context.extend({
  _template: _.template( $('#widgets-widget_variable_value_template').html() ),

  initialize: function(options) {

    App.View.Widgets.Deprecated.Context.prototype.initialize.call(this,options);

    this.model = options.model;
    this.listenTo(this.model,"change:agg",function(){
      this.model.fetch();
    });

    this.listenTo(this.model,"change:agg", this.render);
    this.listenTo(this.model,"change:value", this.render);
    this.model.fetch();

    if(options.template){
      this._template = _.template($(options.template).html());
    }
  },

  events: {
    'click .popup_widget li' : '_changeAgg'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({ m: this.model.toJSON() }));
    this.trigger('widget:ready');
    return this;
  },

  _changeAgg:function(e){
    this.model.set('agg',$(e.currentTarget).attr('data-agg'));
  }

});
