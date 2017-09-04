'use strict';

App.View.TourismActivity = Backbone.View.extend({
  _template: _.template( $('#tourism-tourism_activity_template').html() ),
  _template_categories: _.template( $('#tourism-tourism_activity_categories_template').html() ),
  _template_table: _.template( $('#tourism-tourism_activity_table_template').html() ),

  initialize: function(options) {

    App.getNavBar().set({
      visible : true,
      breadcrumb : null
    });

    // this.scopeModel = new App.Model.Scope();
    // this.scopeModel.url = this.scopeModel.urlRoot + '/' + options.scope;
    // this.listenTo(this.scopeModel,"change:id",this._onModelFetched);
    // this.scopeModel.fetch({"reset": true});
    this.scopeModel = App.mv().getScope(options.scope);

    this.collection = new Backbone.Collection();
    this.collection.url = App.config.api_url + '/tourism/activitytypes'
    this.listenTo(this.collection,'reset',this._drawCategories);
    this.collection.fetch({'reset': true});

    this._agrupation = 'oferr';
    this._filters = [];

    this.render();

    this._onModelFetched();
  },

  events: {
    'click': '_hidePopup',
    'click .activity_chart svg .node circle': '_showPopup',
    'click .agrupation a': '_changeType',
    'click .categories .box': '_filter',
    'click .toggle span': '_toggle',
    'click .csv': '_downloadCsv',
  },

  onClose: function(){
  	this.stopListening();
  },

  _onModelFetched: function(){
    var scope = this.scopeModel.get('id');

    App.getNavBar().set({
      breadcrumb : [{
        url: Backbone.history.getFragment(),
        title : 'Tipos de actividades turísticas'
      },{
        url: scope + '/tourism/dashboard',
        title : 'Turismo'
      },
      {
        url: scope + '/dashboard',
        title : this.scopeModel.get('name')
      }]
    });

  },

  _drawCategories:function(){
    var collection = this.collection.toJSON();
    collection = _.groupBy(collection, function(d){return d['ota_cats']});
    this.$('.categories').html(this._template_categories({'categories':collection}))


    this._drawChart();
    this._drawTable();
  },

  _drawChart:function(){
    var _this = this;
    var collection = this.collection.toJSON();

    this.$('.activity_chart svg').remove();
    var max = _.max(collection, function(d){ return d[_this._agrupation]; })[_this._agrupation];
    // var min = Math.min(_.min(collection, function(d){ return d.oferr; }).oferr, _.min(collection, function(d){ return d.demand; }).demand);
    collection = _.groupBy(collection, function(d){return d['otacat_agg_name']});

    var added = [];
    var repeats = [];

    var root = {'name':'root', 'children':[]}
    _.each(collection,function(elem, key) {
      var json = {'name':key,'children':[]}
      _.each(elem,function(e) {
        if((_this._filters.length == 0 || $.inArray( e.ota_cats, _this._filters) >= 0) && e.id_entity != null)
          if($.inArray(e.tipos, added) < 0){
            json.children.push({'name':e.tipos, 'size':e[_this._agrupation] != 0 ? (100*e[_this._agrupation])/max : (100*0.9)/max, 'color':'#' + e.colour, 'offer':e.oferr, 'demand':e.demand})
            added.push(e.tipos);
          }else{
            repeats.push(e)
          }
      });
      root.children.push(json);
    });

    var diameter = _this.$('.activity_chart').height() - 40,
    format = d3.format(",d");

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select(_this.$(".activity_chart")[0]).append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    var node = svg.selectAll(".node")
      .data(bubble.nodes(_this.classes(root))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.className + ": " + format(d.value); });

    node.append("circle")
        .attr("r", function(d) { return d.r<300 ? d.r:300; })
        .attr("offer", function(d) { return d.offer; })
        .attr("demand", function(d) { return d.demand; })
        .attr("type", function(d) { return d.className; })
        .attr("color", function(d) { return d.color; })
        .style("fill", function(d) {return d.color;});

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.className.substring(0, d.r / 3); });


      var circles = this.$('.activity_chart circle');
    _.each(repeats, function(r) {
      for(var i=0; i<circles.length; i++){
        if($(circles[i]).attr('type') == r.tipos){
          if($(circles[i]).attr('color') != '#' + r.colour){
            var node = svg.append('g').html($(circles[i]).closest('.node').html())
                          .attr('class','node')
                          .attr("transform", $(circles[i]).closest('.node').attr('transform'))
                      ;

            node.select('circle').style('opacity','0.3').style('fill',r.colour);
            $(circles[i]).find('text').remove();

            break;
          }
        }
      }
    });

    // svg.append("rect")
    //     .attr("x", 10)
    //     .attr("y", 10)
    //     .attr("width", 247)
    //     .attr("height", 100);


    // svg.selectAll('#tourism_activity .activity_chart circle').on('mousemove', function() {
    //   var x = d3.mouse(this)[0],
    //   y = d3.mouse(this)[1];
    //   console.log(x);
    // });

  },

  _drawTable:function(){
    var _this = this;
    var elements = [];

    var added = [];
    _.each(this.collection.toJSON(),function(e) {
      if($.inArray(e.tipos, added) < 0 && e.tipos != null){
        elements.push(e);
        added.push(e.tipos)
      }
    });

    elements = elements.sort(function(a, b) {

        if(a[_this._agrupation] != b[_this._agrupation])
            return (b[_this._agrupation] > a[_this._agrupation]) ? 1 : ((b[_this._agrupation] < a[_this._agrupation]) ? -1 : 0);
          else
            return (b['tipos'] > a['tipos']) ? 1 : ((b['tipos'] < a['tipos']) ? -1 : 0);
    });

    var added = [];
    _.each(function() {

    });


    this.$('.activity_table').html(this._template_table({'elements':elements, 'filters':this._filters}))
  },

  classes:function(root){
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({className: node.name, value: node.size, color:node.color, offer:node.offer, demand:node.demand});
    }

    recurse(null, root);
    return {children: classes};
  },

  _showPopup:function(e){
    var _this = this;
    this.$('.activity_popup').addClass('hiden');
    this.$('.activity_popup .offer').html(App.nbf($(e.target).attr('offer')));
    this.$('.activity_popup .demand').html(App.nbf($(e.target).attr('demand')));
    this.$('.activity_popup span').removeClass('active');
    this._agrupation == 'oferr' ?
      this.$('.activity_popup .offer').closest('span').addClass('active'):
      this.$('.activity_popup .demand').closest('span').addClass('active');

    this.$('.activity_popup .title').text($(e.target).attr('type') + ' ');
    // this.$('.activity_popup .title').css({'color':$(e.target).css('fill')});
    var categories = '';
    _.each(_this.collection.toJSON(), function(c) {
      if(c.tipos == $(e.target).attr('type')){
        categories += '<span style="color:#' + c.colour + '">[' + c.ota_cats + '] </span>'
      }
    });

    this.$('.activity_popup .title').append(categories);

    this.$('.activity_popup').css({'left':e.pageX - $('.activity_chart').offset().left - this.$('.activity_popup').width()/2, 'top':e.pageY-$('.activity_chart').offset().top - this.$('.activity_popup').height() - 10});
    setTimeout(function(){
      _this.$('.activity_popup').removeClass('hiden');
    }, 100);

  },

  _hidePopup:function(){
    this.$('.activity_popup').addClass('hiden');
  },

  _changeType:function(e){
    e.preventDefault();
    this.$('.agrupation a').removeClass('active');
    $(e.currentTarget).addClass('active');
    this._agrupation = $(e.currentTarget).attr('type')
    !this.$('.activity_chart').hasClass('hide') ? this._drawChart():null;
    this._drawTable();
  },

  _filter:function(e){
    $(e.target).toggleClass('active');
    if($(e.target).hasClass('active')){
      var color = $(e.target).find('.title').css('color');
      $(e.target).css({'background-color':color});
      $(e.target).find('.title').css({'color':'#003146'});
      this._filters.push($(e.target).find('.title').text());

    }else{
      var color = $(e.target).css('background-color');
      $(e.target).css({'background-color':'#fff'});
      $(e.target).find('.title').css({'color':color});
      this._filters = _.without(this._filters, $(e.target).find('.title').text());
    }
    !this.$('.activity_chart').hasClass('hide') ? this._drawChart():null;
    this._drawTable();
  },

  _toggle:function(e){
    this.$('.toggle span').removeClass('active');
    this.$(e.currentTarget).addClass('active');
    if($(e.currentTarget).attr('type') == 'table_ranking'){
      this.$('.activity_chart').addClass('hide');
      this.$('.thematic_legend').addClass('hide');
      this.$('.activity_table').removeClass('hide');
      this.$('.content_chart').addClass('table');
      this.$('.csv').removeClass('hide');
      this._drawTable();
    }else{
      this.$('.activity_chart').removeClass('hide');
      this.$('.thematic_legend').removeClass('hide');
      this.$('.activity_table').addClass('hide');
      this.$('.content_chart').removeClass('table');
      this.$('.csv').addClass('hide');
      this._drawChart();
    }
  },

  _downloadCsv:function(){

    var _this = this;
    var elements = [];

    var added = [];
    _.each(this.collection.toJSON(),function(e) {
      if($.inArray(e.tipos, added) < 0 && e.tipos != null){
        elements.push(e);
        added.push(e.tipos)
      }
    });

    elements = elements.sort(function(a, b) {

        if(a[_this._agrupation] != b[_this._agrupation])
            return (b[_this._agrupation] > a[_this._agrupation]) ? 1 : ((b[_this._agrupation] < a[_this._agrupation]) ? -1 : 0);
          else
            return (b['tipos'] > a['tipos']) ? 1 : ((b['tipos'] < a['tipos']) ? -1 : 0);
    });

    var csvContent = "";
    csvContent += 'Actividad,Oferta,Demanda' + "\n";
    _.each(elements,function(e){
      var dataString = e.tipos + ',' + e.oferr + ',' + e.demand;
      csvContent += dataString+ "\n";
    });
    var encodedUri = encodeURI(csvContent);
    // this.$('.download_csv').attr("href", encodedUri);
    this.$('.download_csv').attr("href", "data:text/csv;charset=utf-8,\uFEFF" + encodedUri);
    this.$('.download_csv').attr("download", "activities.csv");
    this.$('.download_csv').get(0).click();
  },

  render: function(){
    this.setElement(this._template({}));
    return this;
  }

});
