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

App.View.Widgets.Frame.FrameContent = Backbone.View.extend({

	_template: _.template( $('#widgets-Frame-widget_frame_content_template').html() ),

  initialize: function (options) {
  	this._model = options.model;
  },

  events: { },

  render: function () {
    this.setElement(this._template({model: this._model.toJSON()}));
    return this;
  }

});

App.View.Widgets.Frame.FrameEdit = Backbone.View.extend({
  _template: _.template( $('#widgets-Frame-widget_frame_edit_template').html() ),

  events: {
    'change input[name="descriptionFile"]': '_changeFile',
    'click #optionsDescriptionType input[type="radio"]': '_changeDescriptionType',
    'click .button.save': '_saveAndExit',
    'click .button.cancel': '_cancelAndExit'
  },

  initialize: function (options) {
    if (options.collection) {
      this.collection = options.collection;
      _.defaults(this.collection,{
        type: 'cityanalytics',
        vertical: null
      });
    } else {
      throw 'Error: Frame object needs a scope collection';
    }
  },

  render: function () {
    this.$el.html(this._template({
      m: this.model ? this.model.toJSON() : {}
    }));

    return this;
  },

  _changeDescriptionType: function(e) {
    var wrapperDescriptionFile = this.$('#wrapperDescriptionFile');
    var wrapperDescription = this.$('#wrapperDescription');

    if (e.currentTarget.value === 'image') {
      wrapperDescriptionFile.removeClass('hide');
      wrapperDescription.addClass('hide');
    } else { 
      wrapperDescriptionFile.addClass('hide');
      wrapperDescription.removeClass('hide');
    }
  },

  _changeFile: function(e) {
    var files = _.filter(e.currentTarget.files, function(file) {
      return RegExp(/image\/(jpeg|gif|png|jpg)/i).test(file.type);
    });

    if (files.length > 0) {
      App.Utils.imgToBase64(files[0])
        .then(function(data) {
          var description = this.$('#description');
          if (description.length > 0) {
            description[0].value = data;
          }
        }.bind(this));
    } else {
      alert('Tipo de fichero no soportado');
      e.currentTarget.value = '';
    }
  }, 

  _cancelAndExit: function (e) {
    e.preventDefault();
    this.trigger('close', {});
  },

  _saveAndExit: function (e) {
    e.preventDefault();

    var data = {
      scope: this.collection.options.scope
    };
    this.$('form').serializeArray().map(
      function (x) {
        data[x.name] = x.value;
      }
    );
    data['type'] = this.collection.type;
    data['vertical'] = this.collection.vertical;

    var _this = this;
    if (!this.model) {
      this.collection.create(data, {wait: true});
    } else {
      this.model.save(data, {
        success: function () {
          _this.collection.trigger('update');
          _this.trigger('close', {});
        },
        failure: function (error) {
          console.log('Error: ' + error);
        }
      });
    }
  }
});
