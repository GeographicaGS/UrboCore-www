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

App.View.Admin.SupportDetail = Backbone.View.extend({
  _template: _.template( $('#admin-support_detail_template').html() ),
  
  _questionTemplates: {
    question1: '#admin-support_detail_question1_template',
    question2: '#admin-support_detail_question2_template',
  },

  events: {
    'click .support-question .title': '_toggleQuestionText',
  },

  initialize: function(options){
    this._id_question = options.id_question;

    _.bindAll(this, 'render');    
    this.render();
  },

  render: function(){
    this.$el.html(this._template({}));
    this._drawCurrentQuestion();

    return this;
  },

  _drawCurrentQuestion: function() {
    var currentTemplate = $(this._questionTemplates[this._id_question]).html();

    if(currentTemplate) {
      this.$('#question-content').html(_.template(currentTemplate, {}));
    }
  },

  _toggleQuestionText: function(e) {
    var currentTarget = e.currentTarget;
    var targetText = currentTarget.nextElementSibling;
    
    $([currentTarget, targetText]).toggleClass('open');
  }

});
