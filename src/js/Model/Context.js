'use strict';

App.Model.Context = Backbone.Model.extend({
  defaults:{
    start: false,
    finish: false,
    bbox_info: true,
    bbox_status: false,
    bbox: null
  },

  initialize: function(attributes,options) {
    Backbone.Model.prototype.initialize.call(this, [attributes,options]);

    // Check if is local (not global) to avoid loading default dates and check if start or finish dates are set
    if(!(attributes && attributes.local || attributes && attributes.start && attributes.finish)){
      var data;
      try{
        data = JSON.parse(localStorage.getItem('context')) || {};

        if (data.start)
          data.start = moment.utc(data.start);
        else
          data.start = moment().subtract(7, 'days').utc();

        if (data.finish)
          data.finish = moment.utc(data.finish);
        else
          data.finish = moment().utc();
      }
      catch(err){
        data = {};
      }

      if (data){
        this.set(data);
      }
    }

    // Check if is local (not global) to avoid saving changes as default dates
    if(!(attributes && attributes.local))
      this.on('change',this._save);
  },

  _save: function(){
    localStorage.setItem('context',JSON.stringify(this.toJSON()));
  },

  getBBOX : function(){
    return this.get('bbox_status') ? this.get('bbox') : null;
  },

  getDateRange: function(){
    // return {
    //   'start' : moment(this.get('start')).utc().format('YYYY-MM-DD HH:mm:ss'),
    //   'finish' : moment(this.get('finish')).utc().format('YYYY-MM-DD HH:mm:ss')
    // };
    try {
      return {
        'start' : this.get('start').format(),
        'finish' : this.get('finish').format()
      }
    }catch(err){
      return false;
    }
  }


});
