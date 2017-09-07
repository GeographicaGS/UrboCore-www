'use strict';

var tourismMap;

App.View.TourismRanking = Backbone.View.extend({
  _template: _.template( $('#tourism-tourism_ranking_template').html() ),
  _template_table: _.template( $('#tourism-tourism_ranking_table_template').html() ),
  _template_pagination: _.template( $('#tourism-tourism_pagination').html() ),

  initialize: function(options) {
    this.options = options;

    App.getNavBar().set({
      visible : true,
      breadcrumb : null
    });

    this._mapsTypes = {
                        'offer':{
                          'town':'https://smart-admin.cartodb.com/api/v2/viz/6471af1c-12d7-11e6-b4ed-0ecd1babdde5/viz.json',
                          'zona':'https://smart-admin.cartodb.com/api/v2/viz/126545c4-12d9-11e6-ad02-0e31c9be1b51/viz.json',
                          'provincia':'https://smart-admin.cartodb.com/api/v2/viz/6c9af646-12da-11e6-bb20-0e674067d321/viz.json'
                        },
                        'demand':{
                          'town':'https://smart-admin.cartodb.com/api/v2/viz/78cab16a-12d8-11e6-ac67-0e787de82d45/viz.json',
                          'zona':'https://smart-admin.cartodb.com/api/v2/viz/f34c880e-12d9-11e6-b3f6-0e5db1731f59/viz.json',
                          'provincia':'https://smart-admin.cartodb.com/api/v2/viz/d06d51aa-12da-11e6-b3f6-0e5db1731f59/viz.json'
                        }
                      };

    // this.scopeModel = new App.Model.Scope();
    // this.scopeModel.url = this.scopeModel.urlRoot + '/' + options.scope;
    // this.listenTo(this.scopeModel,"change:id",this._onModelFetched);
    // this.scopeModel.fetch({"reset": true});
    this.scopeModel = App.mv().getScope(options.scope);

    this.chartCollection = new Backbone.Collection();
    this.chartCollection.url = App.config.api_url + '/tourism/ranking';
    this.listenTo(this.chartCollection,'reset',this._draw_chart);
    this.chartCollection.fetch({'reset': true});

    this._pageSize = 10;
    this._currentPage = 1;
    this._orderCriteria = options.criteria;
    this._orderAsc = false;
    this._agrupation = null;
    this.render();

    this._onModelFetched();
  },

  events: {
    'click .pagination .current': '_showPagination',
    'click .pagination .next': '_nextPage',
    'click .pagination .back': '_backPage',
    'click .pagination .page_selector li': '_changePage',
    'click .selector .criteria': '_changeCriteria',
    'click .selector .order': '_changeOrder',
    'click .chart .toggle span': '_toggleChart',
    'click .agrupation a': '_changeAgrupation',
    'click .chart .csv': '_downloadCsv',
  },

  onClose: function(){
    this.stopListening();
  },

  _onModelFetched: function(){
    var scope = this.scopeModel.get('id');

    App.getNavBar().set({
      breadcrumb : [{
        url: scope + 'tourism/' + this._orderCriteria ,
        title : 'Ranking de ' + (this._orderCriteria=='offer' ? 'oferta' : 'demanda')
      },{
        url: scope + '/tourism/dashboard',
        title : 'Turismo'
      },
      {
        url: scope + '/dashboard',
        title : this.scopeModel.get('name')
      }]
    });

    this.map = new L.Map(this.$('.map')[0], {
      zoomControl : false,
      minZoom : 2,
      maxZoom : 100,
      scrollWheelZoom: false
    });

    // super-hack
    var _this = this;
    setTimeout(function(){
      _this.map.invalidateSize();
    },500);

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(this.map);

    this.map.setView(this.scopeModel.get('location'), this.scopeModel.get('zoom'));

    this._addLayer(this._orderCriteria,'town');

  },

  _addLayer:function(orderCriteria,agrupation){
    var _this = this;

    if(this._infowindow)
      this._infowindow.set('visibility', false);

    cartodb.createLayer(this.map, this._mapsTypes[orderCriteria][agrupation])
      .addTo(this.map)
      .on('done',function(e){
        _this._layer = e;
        _this._infowindow = e.infowindow;
      })
      .on('error', function(err) {
        console.log("some error occurred: " + err);
      });
  },

  _draw_chart:function(){
    var _this = this;
    this.ranking = this.chartCollection.toJSON();
    var offerValues = [];
    var demandValues = [];
    var maxValue = 0;

    // this.$('.chart svg').html('');
    this.$('.chart .ordinal').remove();

    if(this._agrupation){
      var grouping = _.groupBy(this.ranking, function(d){return d[_this._agrupation]});
      this.ranking = [];
      _.each(grouping, function(value,key){
        var offer = 0;
        var demand = 0;
        value.forEach(function(v) {
          offer += v.offer;
          demand += v.demand;
        });
        _this.ranking.push({'location':key, 'offer':offer, 'demand':demand});
      });
    }

    _.each(this.ranking, function(r){
      if(maxValue < r.offer)
        maxValue = r.offer
      if(maxValue < r.demand)
        maxValue = r.demand
    });

    this.ranking = this.ranking.sort(function(a, b) {
        if (_this._orderAsc){
          if(a[_this._orderCriteria] != b[_this._orderCriteria])
            return (a[_this._orderCriteria] > b[_this._orderCriteria]) ? 1 : ((a[_this._orderCriteria] < b[_this._orderCriteria]) ? -1 : 0);
          else
            return (a['location'] > b['location']) ? 1 : ((a['location'] < b['location']) ? -1 : 0);
        } else{

          if(a[_this._orderCriteria] != b[_this._orderCriteria])
            return (b[_this._orderCriteria] > a[_this._orderCriteria]) ? 1 : ((b[_this._orderCriteria] < a[_this._orderCriteria]) ? -1 : 0);
          else
            return (b['location'] > a['location']) ? 1 : ((b['location'] < a['location']) ? -1 : 0);

        }
    });

    for(var i=((this._currentPage-1) * this._pageSize); i<this._currentPage * this._pageSize && i<this.ranking.length; i++){
      offerValues.push({'label':this.ranking[i].location, 'value':this.ranking[i].offer});
      demandValues.push({'label':this.ranking[i].location, 'value':this.ranking[i].demand})
    }

    var chartData = [
      {
        'key': 'Oferta',
        'color': '#ff812c',
        'values':offerValues
      },
      {
        'key': 'Demanda',
        'color': '#ffb456',
        'values':demandValues
      }
    ];

    var chart = nv.models.multiBarHorizontalChart()
         .x(function(d) { return d.label })
         .y(function(d) { return d.value })
         .showValues(false)
         .valueFormat(App.d3Format.numberFormat('s'))
         .showControls(false)
         .showLegend(true)
         .duration(350)
         .margin({"top":0, 'left':255})
         .yDomain([0,maxValue])
         .groupSpacing(this.groupSpacing ? this.groupSpacing:0.3)
    ;

    chart.tooltip.contentGenerator(function (obj) {
      return '<table>'
                +'<thead>'
                  +'<tr>'
                    +'<td colspan="3"><strong class="x-value">'+obj.data.label+'</strong></td>'
                  +'</tr>'
                +'</thead>'
                +'<tbody>'
                  +'<tr>'
                    +'<td class="legend-color-guide">'
                      +'<div style="background-color: '+obj.color+'"></div>'
                    +'</td>'
                    +'<td class="key">'+obj.data.key+'</td>'
                    +'<td class="value">'+App.nbf(obj.data.value)+'</td>'
                  +'</tr>'
                +'</tbody>'
              +'</table>'
      ;
    })

    chart.yAxis.showMaxMin(false).tickFormat(App.d3Format.numberFormat('s'));
    chart.yAxis.orient("top");
    chart.xAxis.tickPadding(60);
    chart.legend.margin({bottom: 46})

    d3.select(_this.$('.chart svg')[0])
      .datum(chartData)
      .call(chart)
    ;

    $.each(d3.selectAll(_this.$('.chart svg .nv-x .nv-axis .tick'))[0], function(i,text) {

      var aux = d3.select(this).select('text').node().getComputedTextLength();
      d3.select(this).select('text').attr('transform','translate(' + (aux - 175) + ',0)');
     });


    // var count = (this._currentPage -1) * this._pageSize + 1;
    // for(var i=0; i<this._pageSize && count<=this.ranking.length; i++){
    //   var transform = $($(d3.selectAll(this.$('.chart svg .nv-x .nv-axis .tick[style*="opacity: 1e-06"]'))[0])[i]).attr('transform')
    //   transform = transform == undefined || transform == null ? $($(d3.selectAll(this.$('.chart svg .nv-x .nv-axis .tick[style*="opacity: 1"]'))[0])[i]).attr('transform'):transform;
    //   d3.selectAll(this.$('.chart svg .nv-x .nv-axis')).append('g')
    //                                                     .attr('transform', transform)
    //                                                     .append('text')
    //                                                     .text(count + 'º')
    //                                                     .attr('x', -7)
    //                                                     .attr('dy', '.32em')
    //                                                     .attr('class', 'ordinal')
    //                                                     ;
    //   count ++;
    // }


    setTimeout(function(){
      var count = (_this._currentPage -1) * _this._pageSize + 1;
      for(var i=0; i<_this._pageSize && count<=_this.ranking.length; i++){
        var transform = $($(d3.selectAll(this.$('.chart svg .nv-x .nv-axis .tick'))[0])[i]).attr('transform')
        transform = transform == undefined || transform == null ? $($(d3.selectAll(this.$('.chart svg .nv-x .nv-axis .tick[style*="opacity: 1"]'))[0])[i]).attr('transform'):transform;
        d3.selectAll(_this.$('.chart svg .nv-x .nv-axis')).append('g')
                                                          .attr('transform', transform)
                                                          .append('text')
                                                          .text(count + 'º')
                                                          .attr('x', -7)
                                                          .attr('dy', '.32em')
                                                          .attr('class', 'ordinal')
                                                          ;
        count ++;
      }
    }, 600);

    this._draw_table();

    if($('.pagination').children().length == 0)
      this.$('.pagination').html(this._template_pagination({
                                                            'total':this.ranking.length,
                                                            'pageSize':this._pageSize
                                                          }));

    this._currentPage == 1 ? this.$('.pagination .back').removeClass('active') : this.$('.pagination .back').addClass('active')
    this._currentPage == this.$('.pagination .page_selector li').length ? this.$('.pagination .next').removeClass('active') : this.$('.pagination .next').addClass('active');

  },

  _draw_table:function(){
    this.$('.table').html(this._template_table({
      'ranking':this.ranking.slice((this._currentPage-1) * this._pageSize,this._currentPage * this._pageSize),
      'agrupation':this._agrupation
    }));
  },

  _showPagination:function(){
    $('.pagination .page_selector').toggleClass('active');
  },

  _changePage:function(e){
    this.$('.pagination .page_selector li').removeClass('active');
    $(e.target).addClass('active');
    this._currentPage = parseInt($(e.target).attr('page'));
    this.$('.pagination .current').text($(e.target).text());
    this.$('.pagination .page_selector').removeClass('active');
    this._draw_chart();
  },

  _nextPage:function(){
    this._currentPage ++;
    this.$('.pagination .page_selector li[page=' + this._currentPage + ']').trigger('click');
  },

  _backPage:function(){
    this._currentPage --;
    this.$('.pagination .page_selector li[page=' + this._currentPage + ']').trigger('click');
  },

  _changeCriteria:function(e){
    this.$('.chart svg').children().remove();
    var criteria = $(e.target).text();
    if(criteria == 'oferta'){
      $(e.target).text('demanda');
      this._orderCriteria = 'demand'
    }else if(criteria == 'demanda'){
      $(e.target).text('oferta');
      this._orderCriteria = 'offer'
    }
    this._currentPage = 1;
    $('.pagination').children().remove();
    this._draw_chart();

    this.map.removeLayer(this._layer);
    this._addLayer(this._orderCriteria,this._agrupation == undefined || this._agrupation==null ? 'town':this._agrupation);

    App.router.navigate(this.scopeModel.get('id') + '/tourism/ranking/' + this._orderCriteria ,{trigger: false})
  },

  _changeOrder:function(e){
    this.$('.chart svg').children().remove();
    var order = $(e.target).text();
    if(order == 'descendente'){
      $(e.target).text('ascendente');
      $(e.target).removeClass('desc').addClass('asc');
      this._orderAsc = true;
    }else if(order == 'ascendente'){
      $(e.target).text('descendente');
      $(e.target).removeClass('asc').addClass('desc');
      this._orderAsc = false;
    }
    this._currentPage = 1;
    $('.pagination').children().remove();
    this._draw_chart();
  },

  _toggleChart:function(e){
    if(!$(e.currentTarget).hasClass('active')){
      this.$('.chart .toggle span').removeClass('active');
      $(e.currentTarget).addClass('active');
      d3.select('#chart_ranking').classed('hiden',!d3.select('#chart_ranking').classed('hiden'));
      this.$('#table_ranking').addClass('hiden');
      // this.$('#' + $(e.currentTarget).attr('type')).removeClass('hiden');
      if($(e.currentTarget).attr('type') == 'chart_ranking'){
        this.$('.chart svg').children().remove();
        this._draw_chart();
        this.$('.chart .csv').addClass('hide');
      }else{
        this.$('#table_ranking').removeClass('hiden');
        this.$('.chart .csv').removeClass('hide')
      }
    }
  },

  _changeAgrupation:function(e){
    this._agrupation = $(e.currentTarget).attr('type');
    this.$('.agrupation a').removeClass('active');
    $(e.currentTarget).addClass('active');
    $('.pagination').children().remove();
    this._currentPage = 1;
    this._agrupation == 'zona' ? this._pageSize = 11 : this._pageSize = 10;
    this._draw_chart();

    this.map.removeLayer(this._layer);
    this._addLayer(this._orderCriteria,this._agrupation == undefined || this._agrupation==null ? 'town':this._agrupation);
  },

  _downloadCsv:function(){
    var csvContent = "";
    var zone = 'Municipio'
    if(this._agrupation == 'zona'){
      zone = 'Comarca';
    }else if(this._agrupation == 'provincia'){
      zone = 'Provincia';
    }
    csvContent += zone + ',' + 'Oferta' + ',' + 'Demanda' + "\n";
    _.each(this.ranking,function(r){
      var dataString = r.location + ',' + r.offer + ',' + r.demand;
      csvContent += dataString+ "\n";
    });
    var encodedUri = encodeURI(csvContent);
    // this.$('.chart .download_csv').attr("href", encodedUri);
    this.$('.chart .download_csv').attr("href", "data:text/csv;charset=utf-8,\uFEFF" + encodedUri);
    this.$('.chart .download_csv').attr("download", "ranking.csv");
    this.$('.chart .download_csv').get(0).click();
  },

  render: function(){
    this.$el.html(this._template({
      'criteria': this._orderCriteria
    }));
    return this;
  }

});
