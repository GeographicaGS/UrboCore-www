'use strict';

App.Collection.DevicesGroupTimeserie = Backbone.Collection.extend({
	initialize: function(models,options) {
			this.options = options;
	},

	url: function(){
		return App.config.api_url + '/' + this.options.scope +'/variables/' + this.options.variable + '/devices_group_timeserie'
	},

	parse: function(response) {

		var aux = {};

		_.each(response, function(r) {
			_.each(Object.keys(r.data), function(k) {
					if(!aux[k])
						aux[k] = [];
					if(r.data[k] != null)
						aux[k].push({'x':new Date(r.time), 'y':k == 'seconds' ? r.data[k]/60:r.data[k]});
			});
		});

		response = _.map(aux, function(values, key){
			return {'key':key, 'values':values, 'disabled':false}
		});

		return response;
	},

	fetch: function(options) {

		options = options || {};

		var date = App.ctx.getDateRange();
		options['data'] = {
			'start': date.start,
			'finish': date.finish,
			'id_variable':this.options.variable,
			'step':this.options.step,
			'agg':this.options.agg,
			'groupagg':true
		};

		if(App.ctx.get('bbox'))
			options['data']['bbox'] = App.ctx.get('bbox');

		return Backbone.Collection.prototype.fetch.call(this, options);
	}
});
