'use strict';

App.Collection.MultiScope = Backbone.Collection.extend({

	url: App.config.api_url + '/scopes',

  initialize: function(models, options) {
		this.options = options;
  },

	fetch: function(options) {
		if(!options || !options.data){
			options = options || {};
      options.data= {};
    }
		if(this.options) {
			if(this.options.multi == 'todos') {
				this.options.multi = null;
			} else if(this.options.multi == 'unico') {
				this.options.multi = false;
			} else if(this.options.multi == 'multi') {
				this.options.multi = true;
			}
			options['data']['multi'] = this.options.multi;
		}

		return Backbone.Collection.prototype.fetch.call(this, options);
	},

	parse: function(responseEntry) {
		var response = responseEntry;
    var scopeOsuna = undefined;
    _.each(response, function(scope) {
      if(scope.id == 'osuna') {
        scopeOsuna = scope;
      }
    });
		// if(scopeOsuna != undefined) {
    // 	scopeOsuna.categories.push('waste_d');
		// }
    return response;
  }
});
