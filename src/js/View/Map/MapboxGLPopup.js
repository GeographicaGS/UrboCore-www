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
App.View.Map.RowsTemplate = {
  BASIC_ROW: _.template($('#map-popups-basic_row_template').html()),
  EXTENDED_TITLE: _.template($('#map-popups-extended_title_template').html())
};

App.View.Map.MapboxGLPopup = Backbone.View.extend({
  initialize: function(template) {
    this._template = _.template($(template).html());
  },

  /**
   * @deprecated
   */
  bindData: function(label, properties, clicked, deviceViewLink = false) {
    return this._template({
      'classes': '',
      'name': label,
      'properties': _.filter(_.map(properties, function(p) {
        var multipleFeatures = p.feature.split(" ");
        let value;
        p.value = '';
        _.each(multipleFeatures, (attr, i) => {
          let forTranslate = attr.includes('|translate');
          if (forTranslate) {
            attr = attr.replace('|translate','')
          }
          
          if (attr.includes('#')) {
            let access = attr.split('#');
            value = JSON.parse(clicked.features[0].properties[access[0]])[access[1]];
          } else if (attr.includes('?')) {
            //optional feature
            let access = attr.split("?");
            value = clicked.features[0].properties[access[0]];
            if(!value) {
              if (i === 0) {
                p.optional = true;
                return;
              }
              p.optional = true && p.optional;
              return ;
            }
          }else {
            value = clicked.features[0].properties[attr];  
          }

          if (forTranslate) {
            value = __(value);
          }

          if(p && (value || value === 0))
            p.value = ((p.value)? p.value + ' · ' : '' ) + value;
          
          if(p && !p.value && p.value !== 0) {
            p.value = '--';
          }
          if(p && p.value && p.nbf) {
            p.value = p.nbf(p.value);
          }
        });
        if (p.optional && !p.value) {
          p = null;
        }
        return p;
      }),function(e){return e !== null}),
      'loading': false,
      'deviceViewLink': deviceViewLink
    });
  },

  /**
   * @deprecated
   */
  drawTemplate: function(label, properties, clicked, popup, deviceViewLink = false) {
    if (typeof properties === 'function') {
      setTimeout(function() {
        properties = properties(clicked, popup, this)
      }.bind(this),500);
      return this._template({
        'name': label,
        'properties': [],
        'loading': true,
        'deviceViewLink': deviceViewLink
      });
    } else {
      return this.bindData(label, properties, clicked, deviceViewLink);
    }

  },

  drawTemplatesRow: function(classes, label, templates, clicked, popup) {
    var _this = this;
    if (typeof templates === 'function') {
      templates = templates(clicked);
    }
    return this._template({
      'classes': classes,
      'name': label,
      'templates': _.filter(_.map(templates, function(template) {

        var props = _.map(template.properties, function(property) {
          return {
            label: property.label,
            value: _this.__replacePropertyByValue(property,clicked),
            units: property.units
          }
        });
        if (props)
          return {
            classes: template.classes,
            output: template.output({ properties: props})
          };
      }),function(i) { return i }),
      'loading': false,
      'properties': [], // TODO: DEPRECATED PROPERTIES
      'deviceViewLink': null // TODO: DEPRECATED PROPERTIES
    });
  },

  __replacePropertyByValue: function(property, event) {
    debugger;
    var clickedProperties = event.features[0].properties;
    // property can contains '#' (navigation), '| translate' (for translation) and '?' (optionals)
    var isOptional = property.value.includes('?');
    property.value = property.value.replace(/\?/g,'');

    var toTranslate = property.value.includes('| translate');
    property.value = property.value.replace(/\| translate/g,'');
    
    var navigation = property.value.split('#');

    var propertiesNavigated = clickedProperties;
    for(var i = 0; i < navigation.length; i++) {
      var step = navigation[i];
      if (!propertiesNavigated.hasOwnProperty(step)) {
        break;
      }
      propertiesNavigated = propertiesNavigated[step];
    }

    if (toTranslate && !propertiesNavigated) {
      propertiesNavigated = __(propertiesNavigated);
    }

    // TODO: If properties is OPTIONAL?????
    
    return propertiesNavigated;
  }
});
