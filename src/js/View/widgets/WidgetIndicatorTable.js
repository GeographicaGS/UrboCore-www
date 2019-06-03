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

App.View.Widgets.IndicadorTable =  App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{timeMode:'null', dimension: 'fullWidth allHeight bgWhite'});
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    // Skip more code if widget is not allowed
    if(!this.hasPermissions()) return;

    var _this = this;
    var tableModel = new Backbone.Model({
      'css_class':'',
      'csv':true,
      'columns_format':{
        'name':{
          'title': __('Indicador'),
          'css_class':'counter greyDark',
          'formatFN':function(d){

            // Fix the changes in models and collections (BaseModel & BaseCollections)
            if (_this.dataCollection &&
              _this.dataCollection.options &&
              typeof _this.dataCollection.options.data === 'string') {
                _this.dataCollection.options.data = JSON.parse(_this.dataCollection.options.data);
            }

            var elem = _this.dataCollection.findWhere({'name':d})
            var i = _this.dataCollection.indexOf(elem);

            if(i == 0)
              return d + ' ' + new Date(_this.dataCollection.options.data.time.start).toLocaleString(App.lang,{month: 'long',year: 'numeric'});
            else
              return d + ' <i class="grey4">(' + elem.get('periodicity') + ')</i>';

          },
          flag: function(d){
            if(d <= 80) return __('Penalización máxima');
            else if (80 < d && d <= 90) return __('Penalización progresiva');
            else if (90 < d && d <= 95) return __('Sin penalización');
            else if (95 < d && d < 100) return __('Bonificación progresiva');
            else return __('Bonificación máxima');
          },
          class_flag: function(d){
            if(!d) return '';
            else if(d <= 90) return 'bad';
            else if (90 < d && d <= 95) return 'moderate';
            else return 'good';
          },
        },

        'value': {'title': __('Valor'), 'css_class':'', 'formatFN':function(d){
          var color;
          if(d <= 90)
            color = 'bad';
          else if (90 < d && d <= 95)
            color = 'moderate';
          else
            color = 'good';
          return App.nbf(d) + '<span class="icon circle ' + color + '"></span>';
        }}
        }
    });

		this.dataCollection = new App.Collection.Post([],{data:{language:App.lang, time:{start:options.date}}});
    this.dataCollection.url = App.config.api_url + '/' + options.id_scope +'/' + options.id_category + '/indicators'

		this.subviews.push(new App.View.Widgets.Table({
      model: tableModel,
      data: this.dataCollection,
      template:_.template( $('#indicator_table_template').html()),
      listenContext:false
    }));

  }

});
