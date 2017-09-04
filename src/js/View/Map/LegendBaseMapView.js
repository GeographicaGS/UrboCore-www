'use strict';

App.View.Map.LegendBase = Backbone.View.extend({
  _template: _.template( $('#map-legend_base_template').html() ),

  initialize: function(options) {
    this.options = _.extend({
      timeMode: 'historic',
      title: __('Mapa'),
      legendTemplate: false,
      infoTemplate: false,
      infoClass:'stretch',
      legendClass:'stretch'
    },options);
  },

  events: {
    'click .tooltipIcon.info': 'showInfo',
    'click .legendLink': 'showLegend'
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.append(this._template({opts: this.options}));

    if(this.options.legendTemplate){
      var $legendContainer = this.$('.legendContainer');
      var $legend = $(_.template(this.options.legendTemplate)());
      $legendContainer.append($legend);
      // Check size
      if($legendContainer.outerWidth() > this.$el.innerWidth() / 2.5){
        // Hide legend and show a link
        $legend.addClass('hide');
        // $legendContainer.children('.legendLink').removeClass('hide');
        $legendContainer.html(_.template('<h3 class="legendLink"><img src="/img/SC_ic_leyenda.svg">' + __("Ver leyenda") + '</h3>')());
      }

      if(this.options.legendExtraTemplate){
        $legendContainer.append(_.template('<h3 class="legendLink"><img src="/img/SC_ic_leyenda.svg">' + __("Ver leyenda completa") + '</h3>')());
      }
    }

    return this;
  },

  showInfo: function(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
    } 
    if(this.options.infoTemplate){
      if(this._popUpView == undefined) {
        this._popUpView = new App.View.PopUp({
          model: new Backbone.Model({
            title: this.options.title,
            // classModal: this.options.infoClass
          })
        });
      }
      this._popUpView.model.set('classModal',this.options.infoClass)
      this._popUpView.internalView = new App.View.BasicView({ template: this.options.infoTemplate });
      this.$el.append(this._popUpView.render().$el);

      this._popUpView.show();
    }
  },

  showLegend: function(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
    } 
    if(this.options.infoTemplate){
      if(this._popUpView == undefined) {
        this._popUpView = new App.View.PopUp({
          model: new Backbone.Model({
            title: __('Leyenda'),
            // classModal: this.options.legendClass
          })
        });
      }
      this._popUpView.model.set('classModal',this.options.legendClass)
      this._popUpView.internalView = new App.View.BasicView({ template: this.options.legendExtraTemplate ? this.options.legendExtraTemplate : this.options.legendTemplate });
      this.$el.append(this._popUpView.render().$el);

      this._popUpView.show();
    }
  }
});
