App.View.Map.VariableSelector = Backbone.View.extend({
  
    events: {
      'click .variableselector': 'toggle',
      'click .option': 'changeVariable'
    },
  
    initialize: function(options) {
      options = _.defaults(options, {
        variables: []
      })
      this.options = options;
      this._template = _.template($("#map-variable_selector").html());
    
    },
  
    render: function() {
      this.$el[0].id = 'variableselector';
      this.$el.append(this._template({'variables': this.options.variables}));
      return this;
    },
  
    changeVariable: function(e) {
      this.$el.find('.selected').html(e.target.innerText);
      this.$el.find('.option').removeClass('choosen');
      e.target.classList.toggle('choosen');
      this.options.filterModel.set('variable',e.target.getAttribute('data-item-value'));
    },

    toggle: function(e) {
      this.$el.find('.options').toggleClass('showing');
    }  
  });