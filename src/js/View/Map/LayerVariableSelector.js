App.View.Map.VariableSelector = Backbone.View.extend({
  
    events: {
      'change #vselector': 'changeVariable'
    },
  
    initialize: function(options) {
      options = _.defaults(options, {
        variables: []
      })
      this.options = options;
      this.variable = new Backbone.Model();
      this._template = _.template($("#map-variable_selector").html());
    
    },
  
    render: function() {
      this.$el[0].id = 'variableselector';
      this.$el.append(this._template({'variables': this.options.variables}));
      return this;
    },
  
    changeVariable: function(e) {
      this.variable.set('variable',e.target.value);
    }
  
  });