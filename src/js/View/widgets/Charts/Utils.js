'use strict';

App.View.Widgets.Charts.Utils = {
  formatAxisDateByCurrentStep: function(d){
    var match, formatDate;
    if((match = this.options.get('currentStep').match(/(\d)d/)) !== null){
      formatDate = 'DD/MM';
    }else if((match = this.options.get('currentStep').match(/(\d)h/)) !== null){
      formatDate = 'DD/MM HH:mm';
    }
    return App.formatDate(d,formatDate);
  }
};
