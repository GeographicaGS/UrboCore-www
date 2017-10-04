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

App.View.Widgets.IndicadorGauge =  App.View.Widgets.Base.extend({

  initialize: function(options) {
    var _this = this;
    options = _.defaults(options,
      {
        title:'Indicador',
        last:false
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
		var indicatorModel = new App.Model.Post();
		indicatorModel.url = App.config.api_url + '/' + options.id_scope +'/' + options.id_category + '/indicators/' + (options.last ? 'last':0)

    this.widgetModel = new Backbone.Model({
      'var_id':options.var_id,
      'date': options.date,
      'extra_info': {
        'unit': '%',
        'format': function(d){return App.nbf(d * 100,4)},
        'class': function(d){
          if(d <= 90) return 'bad';
          else if (90 < d && d <= 95) return 'moderate';
          else return 'good';
        },
        'flag': function(d){
          if(d <= 80) return __('Penalización máxima');
          else if (80 < d && d <= 90) return __('Penalización progresiva');
          else if (90 < d && d <= 95) return __('Sin penalización');
          else if (95 < d && d < 100) return __('Bonificación progresiva');
          else return __('Bonificación máxima');
        }
      },
      'model': indicatorModel
    });

    this.subviews.push(new App.View.Widgets.LviGauge({
      'model': this.widgetModel
    }));

    if(options.timeMode){
      this.listenTo(App.ctx,"change:finish",function(){
        _this.widgetModel.set('date',App.ctx.getDateRange().finish);
        _this.render();
      });
    }

    if(this.options.last){
      this.listenTo(indicatorModel,'sync',function(data){
        _this.$('.title').text(__('Indicador') + ' ' + moment(data.toJSON().period, 'YYYYMM').toDate().toLocaleString(App.lang,{month: 'long',year: 'numeric'}))
      });
    }

  },

  render:function(){
    App.View.Widgets.Base.prototype.render.call(this);
    if(!this.options.last)
      this.$('.title').text(__('Indicador') + ' ' + new Date(this.widgetModel.get('date')).toLocaleString(App.lang,{month: 'long',year: 'numeric'}))
    return this;
  }

});
