'use strict';

App.Model.Device = Backbone.Model.extend({

  durl: function(){
    return App.config.api_url + '/' + this.get('scope') + '/devices';
  }
});
