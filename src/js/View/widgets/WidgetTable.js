'use strict';

App.View.Widgets.Table =  Backbone.View.extend({

  _template: _.template( $('#base_table_template').html() ),

  initialize: function(options) {

    this.options = _.defaults(options,{
      listenContext: true,
      context: App.ctx
    });

    this._listenContext = this.options.listenContext;
    this.model = options.model;
    this.collection = options.data;
    this.ctx = options.context;

    if(this._listenContext)
      this.collection.options.data = {};

    this.listenTo(this.collection,"reset",this._drawTable);

    if(options['template']){
      this._template = options['template'];
    }

    this._tableToCsv = new App.Collection.TableToCsv()
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;

  },

  events: {
    'click .table button':'_downloadCsv'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){

    this.$el.append(App.widgetLoading());
    if(this._listenContext){
      if (this.model.get('method')=='GET')
        _.extend(this.collection.options.data, this.ctx.getDateRange());
      else
        this.collection.options.data.time = this.ctx.getDateRange();
    }

    this.collection.fetch({reset: true, data: this.collection.options.data});

    return this;
  },

  _drawTable:function(){
    this.$el.html(this._template({m:this.model, elements:this.collection.toJSON()}));
  },

  _downloadCsv:function(){
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    // this._tableToCsv.options.format = 'csv';
    this._tableToCsv.options.data.format = 'csv';

    this._tableToCsv.options.reset = false;
    this._tableToCsv.options.dataType = 'text'

    // this._tableToCsv.fetch({'reset':false,'dataType':'text'})
    this._tableToCsv.fetch(this._tableToCsv.options);
  }

});
