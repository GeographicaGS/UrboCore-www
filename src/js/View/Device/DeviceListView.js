'use strict';

App.View.DeviceList = Backbone.View.extend({
  _template: _.template( $('#devices-device_list_template').html() ),

  initialize: function(options) {

	this.model = options.model;
	this._collection = new Backbone.Collection();
	this._collection.url = App.config.api_url + '/' + this.model.get('scope') +'/entities/' + this.model.get('entity') + '/elements';
	this.listenTo(this._collection,'reset',this.render);
	this._collection.fetch({'reset':true});

  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
  	this.$el.html(this._template({'elements':this._collection.toJSON(), 'm':this.model.toJSON()}));
    return this;
  }

});