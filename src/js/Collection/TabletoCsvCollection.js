'use strict';
App.Collection.TableToCsv = Backbone.Collection.extend({

	initialize: function(models,options) {
      this.options = options;
  },

  parse: function(response) {
  	var blob = new Blob([response], {type:'text/csv'});
		var csvUrl = window.URL.createObjectURL(blob);
		var link = document.createElement("a");
		link.setAttribute("href", csvUrl);
		link.setAttribute("download", "download.csv");
    document.body.appendChild(link);
		link.click();
    document.body.removeChild(link);
  }

});
