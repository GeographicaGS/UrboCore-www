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

App.View.SubHeader = Backbone.View.extend({
  _template: _.template( $('#subheader_template').html() ),
  className:'subheaderbar',

  initialize: function(options) {
    this.listenTo(this.model,'change',this.render);
    this.render();
  },

  events: {
    'click a':'_back'
  },

  _back : function(e){
    e.preventDefault();
    App.router.navigate(this.model.get('backurl'),{trigger: true})

  },
  onClose: function(){
    this.stopListening();        
  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON()}));
    return this;
  }

});
