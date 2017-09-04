'use strict';

App.View.Widgets.Deprecated.Table = Backbone.View.extend({
  _template: _.template( $('#widgets-widget_table_template').html() ),

  initialize: function(options) {

  	this.model = options.model;
    this._stepModel = options.stepModel;
    this.collection = options.collection;
    this._aggCollection = options.aggCollection;

    if(this._stepModel){
      this.listenTo(this._stepModel,"change:step",function(){
        this.onContextChange();
      });
    }

  	this.listenTo(this.collection,"reset",this.render);
  	this.listenTo(this.collection,"add",this.render);
  	this.collection.fetch({'reset':true})



    if(this._aggCollection){
      this.listenTo(this._aggCollection,"change",function(){
        this.onContextChange();
      });
    }

    this._ctx = App.ctx;
    this.listenTo(this._ctx,'change:start change:finish change:bbox', this.onContextChange);

    this._tableToCsv = new App.Collection.TableToCsv()
    this._tableToCsv.url = this.collection.url;
    this._tableToCsv.fetch = this.collection.fetch;


    this.render();
    this.$('h4').append(App.circleLoading());

  },

  events: {
    'click .table button':'_downloadCsv'
  },


  onClose: function(){
    this.stopListening();
  },

  render: function(){
  	this.$el.html(this._template({'m':this.model, 'elements':this.collection.toJSON()}));
    return this;
  },

  onContextChange: function(){
    $('.table').addClass('loading');
    this.$('.loading.circle').remove();
    this.$('h4').append(App.circleLoading());
    var _this = this;
    if(this._stepModel){
      this.collection.options.step = this._stepModel.get('step');
    }
    if(this._aggCollection){
      _this.collection.options.agg = '';
      _.each(this._aggCollection.toJSON(), function(j) {
        _this.collection.options.agg = j.agg + ','
      });
      this.collection.options.agg = this.collection.options.agg.slice(0, -1);
    }
    this.collection.fetch({'reset':true})
  },

  _downloadCsv:function(){
    this._tableToCsv.options = App.Utils.toDeepJSON(this.collection.options);
    this._tableToCsv.options.format = 'csv';
    this._tableToCsv.fetch({'reset':false,'dataType':'text'})
  }

});
