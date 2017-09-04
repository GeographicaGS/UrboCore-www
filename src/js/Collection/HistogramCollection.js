App.Collection.Histogram = App.Collection.Post.extend({

  url: function() {
    return App.config.api_url + '/' + this.options.scope + '/variables/' + this.options.variable
          + '/histogram/' + this.options.type + '/' + this.options.mode
  },

  parse: function(response) {
    if(this.options.type === 'timeserie'){
      return response;
    }else{
      var result = [];
      _.each(response, function(r,index){
        result.push({'name':r.category||index, 'value':r.value||response[r]});
      });
      return result;
    }
  }
});
