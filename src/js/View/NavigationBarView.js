'use strict';

App.View.NavigationBar = Backbone.View.extend({
  _template: _.template( $('#navigation_bar_template').html() ),
  className:'navbar',
  menuActivated:-1,

  initialize: function(options) {
    _.bindAll(this,'_route');
    this.model = options.model;
    this.listenTo(this.model,'change:breadcrumb',this.render);
    this.listenTo(this.model,'change:cities',this._renderMenuPanelView);
    this.listenTo(this.model,'change:scopeInfo',this._renderMenuPanelView);
    this.listenTo(this.model,'change:section',this._renderMenuPanelView);
    this.listenTo(this.model,'change:visible',this._changeVisibility);
    this._history = [];
    this.$main = $('main');
    Backbone.history.on('route', this._route);
  },

  events: {
    'click a.back':'_back',
    'click a.menu':'_showMenu',
    'click a.menu.active':'_closeMenu',
    'click a.menu.active ~ .menuBg':'_closeMenu',
    'click .button.dropdown':'_togglePopup'
  },

  _route: function(){
    this._history.push(Backbone.history.fragment);
    if (this._history.length>2)
      this._history.splice(0,1);
  },

  _togglePopup:function(e){
    e.preventDefault();
    e.stopPropagation();
    $(e.currentTarget).prev('.genericPopup').toggleClass('active');
    $(e.currentTarget).toggleClass('empty');
  },

  // _back : function(e){
  //   e.preventDefault();
  //   var url;
  //   if (this._history.length==1){
  //     // Go to parent. It happens when loaded from URL
  //     var bc = this.model.get('breadcrumb');
  //     if (!bc || bc.length < 2 ){
  //       // should not happen
  //       url = '';
  //     }
  //     else{
  //       url = bc[1].url;
  //     }
  //   }
  //   else{
  //     // Back
  //     url = this._history[0];
  //   }
  //
  //   url = this._hackURL(url);
  //   App.router.navigate(url,{trigger: true});
  //   // Reset history
  //   this._history.splice(0,1);
  // },

  _back : function(e){
    e.preventDefault();
    var url = this.model.get('backurl');
    if(url == "") {
      url = "/";
    }
    if (!url){
      // Go to parent. It happens when loaded from URL
      var bc = this.model.get('breadcrumb');
      if (!bc || bc.length < 2 ){
        // should not happen
        url = '';
      }
      else if(bc[bc.length-2].url !== Backbone.history.getFragment()){
        //url = bc[1].url;
        url = bc[bc.length-2].url;
      }else{
        url = bc[bc.length-3].url;
      }
    }

    url = this._hackURL(url);
    this.model.set('backurl',null);
    App.router.navigate(url,{trigger: true});


  },

  _hackURL: function(url){
    if (url.startsWith('/'))
      url = url.substring(1);

    if (url == 'osuna/dashboard' || url == 'andalucia/dashboard'  || url == 'doshermanas/dashboard')
      return 'juntadeandalucia/scope';
    else if (url =='guadalajara/dashboard')
      return '/';
    else
      return url;
  },

  _showMenu: function() {
    this.$(".menuPanel").toggleClass("active");
    this.menuActivated = 1;
    this.$(".navElement.menu").addClass("active");
  },

  _closeMenu: function() {
    this.$(".menuPanel").removeClass("active");
    this.$(".menuPanel").removeClass("activeWithoutAnimation");
    this._hideMenuAsync();
    this.$(".navElement.menu").removeClass("active");
    localStorage.setItem('visited', true);
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));
    this._changeVisibility();
    this._renderMenuPanelView();
    return this;
  },

  _renderMenuPanelView: function() {
    this.$("#menuPanel").html(App.circleLoading());
    //Comprobacion para cargar las ciudades del multiambito
    var _cities = this.model.get("cities");
    var _scopeInfo = this.model.get("scopeInfo");

    if(!_.isEmpty(_scopeInfo) && (_cities == undefined || _cities.length==0)) {
      if(_scopeInfo.parent_id != undefined && _scopeInfo.parent_id != 'orphan') {
        // this.scopeParentModel = new App.Model.Scope();
        // this.scopeParentModel.url = this.scopeParentModel.urlRoot + '/' + _scopeInfo.parent_id;
        // this.listenTo(this.scopeParentModel,"change:id",this._fillCities);
        // this.scopeParentModel.fetch({reset:true});
        this.scopeParentModel = App.mv().getScope(_scopeInfo.parent_id);
        this._fillCities();
      } else {
        this.model.set("cities", [_scopeInfo]);
      }
    }

    if(_cities != undefined && ((!_.isEmpty(_scopeInfo) && _cities.length > 0) || _cities.length > 0)) {

      var menuPanelModel = new Backbone.Model({
        cities:App.Utils.toDeepJSON(_cities),
        scopeInfo:_scopeInfo,
        section:this.model.get("section"),
        scopeLoaded:this.model.get("scopeLoaded")
      });
      if(this._menuPanelView != undefined) {
        this._menuPanelView.close();
      }
      this._menuPanelView = new App.View.MenuPanel();
      this._menuPanelView.model = menuPanelModel;
      var content = this._menuPanelView.render().$el;
      this.$("#menuPanel").html(content);
    }
  },

  _fillCities: function() {
    var cities = this.scopeParentModel.toJSON().childs;
    if(cities == undefined) {
      cities = [this.model.get("scopeInfo")];
    }
    this.model.set("cities", cities);
    this._renderMenuPanelView();
  },

  _changeVisibility: function(){
    var _this = this;
    if (this.model.get('visible')){
      this.$el.show();
      this.$main.addClass('navbar');
    }
    else{
      this.$el.hide();
      this.$main.removeClass('navbar');
    }

    if(this.model.get('visible') && this.model.get('menu').showable) {
      if(this.menuActivated == 1) {
        setTimeout(function() {
          $(".menuPanel").addClass("activeWithoutAnimation");
          this.$(".navElement.menu").addClass("active");
        }, 0);
      } else  if(localStorage.getItem('visited') == undefined) {
        setTimeout(function() {
          $(".menuPanel").addClass("active");
          _this.menuActivated = 1;
          this.$(".navElement.menu").addClass("active");
        }, 1000);
        this.menuActivated=0;
      }
    } else {
      $(".menuPanel").removeClass("active");
      $(".menuPanel").removeClass("activeWithoutAnimation");
      this.$(".navElement.menu").removeClass("active");
      this._hideMenuAsync();
    }
  },

  _hideMenuAsync:function() {
    if(this.menuActivated != 0) {
      this.menuActivated = -1;
    }
  }

});
