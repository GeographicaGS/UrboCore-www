// Copyright 2017 Telefónica Digital España S.L.
//
// This file is part of UrboCore WWW.
//
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
//
// For those usages not covered by this license please contact with
// iot_support at tid dot es

'use strict';

// Global variables
var ENTER_KEY = 13;
var availableColors = [
  "#1f77b4",
  "#aec7e8",
  "#ff7f0e",
  "#ffbb78",
  "#2ca02c",
  "#98df8a",
  "#d62728",
  "#ff9896",
  "#9467bd",
  "#c5b0d5",
  "#8c564b",
  "#c49c94",
  "#e377c2",
  "#f7b6d2",
  "#7f7f7f",
  "#c7c7c7",
  "#bcbd22",
  "#dbdb8d",
  "#17becf",
  "#9edae5"
];
// function to translate
var __ = function(d) {
  return d;
};

/**
 * Get the payload to the server request
 * 
 * @param {Object} options - options to the request
 * @returns {Object} - parse object with the options
 */
function getPayLoad(options){
  return {
    url: (typeof this.url == 'function') ? this.url() : this.url,
    data: options ? options.data : null
  }
}

// Override the method "fetch" --> "Backbone.Model"
var fetchModel = Backbone.Model.prototype.fetch;
Backbone.Model.prototype.fetch = function(options) {
  this.payload = getPayLoad.call(this, options);
  fetchModel.call(this, options);
}

// Override the method "fetch" --> "Backbone.Collection"
var fetchCollection = Backbone.Collection.prototype.fetch;
Backbone.Collection.prototype.fetch = function(options){
  this.payload = getPayLoad.call(this,options);
  fetchCollection.call(this, options);
}

/**
 * Function implemented into the object "Backbone.View"
 * to remove it from the DOM and unbind the events associated it
 */
Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();

  if (this.onClose){
    this.onClose();
  }
}

/**
 * DIFFERENTS FUNCTIONS ASSOCIATED 'APP' OBJECT
 */

/**
 * Initial method when the APP is launched
 */
App.ini = function() {

  var _this = this;

  // Before any actions, we must load
  // the JSON file with the language
  App.lang = App.detectCurrentLanguage();

  if (App.lang) {
    $.getJSON('/locale/' + App.lang + '.json')
      .done(function (locale) {
        __ = function(d) {
          return new Jed(locale).gettext(d);
        }
        // Load the scripts that was blocked
        // in the initial load
        App.Utils.loadBlockedScripts(null, function() {
          continueLoadApp.apply(_this);
        })
      })
      .fail(function() {
        App.Utils.loadBlockedScripts(null, function() {
          continueLoadApp.apply(_this);
        });
      });
  } else {
    App.Utils.loadBlockedScripts(null, function() {
      continueLoadApp.apply(_this);
    });
  }

  // Once time the language is loaded, we can
  // continue with the App loading
  function continueLoadApp() {
    window.document.title = __(App.config.title || 'Urbo - Solution for Smart Cities');
    App._updateFavicon();
    $('body').attr('layout', App.config.layout);
    this._filters = {};
    this.$main = $('main');
    this.ctx = new App.Model.Context();
    this.highRangeCtx = new App.Model.Context();
    this._metadata = new App.Metadata();

    if (window.location.pathname.indexOf('/embed/v1/') === -1) {
      this._standardIni();
    } else {
      this._embedIni();
    }
  }
};

/**
 * Standard function
 */
App._standardIni = function(){
  this.mode = 'standard';
  this.auth = new App.Auth();
  this.router = new App.Router();

  // Draw different views that composed the APP
  $('body').attr('mode', this.mode);
  this.header = new App.View.HeaderView({
    el: $('header')
  });
  this.footer = new App.View.FooterView({
    el: $('footer')
  }).render();

  this._navigationBarModel = new App.Model.NavigationBar();
  this._navigationBar = new App.View.NavigationBar({
    el: $('nav.navbar'),
    model: this._navigationBarModel
  }).render();

  // The authentication is launched
  var _this = this;
  this.auth.start(function(st) {
    if (!st){ // Is user logged?
      Backbone.history.start({pushState: true, silent:true, root: '/' + App.lang + '/' });
      // Login using user and pass in the URL
      if (window.location.search.indexOf('user') > -1) {
        _this.router.navigate('login_external' + window.location.search, { trigger: true });
        Backbone.history.loadUrl('login_external' + window.location.search);
      } else {
        _this.router.navigate('login', { trigger: false });
        Backbone.history.loadUrl('login');
      }
    } else {
      _this._metadata.start(function(){
        if (!_this.started){
          _this.started = true;
          Backbone.history.start({pushState: true, root: '/' + App.lang +'/'});
        }
      });
    }
  });
}

/**
 * This function is only triggered when a widget is loaded from
 * external domain (published widgets)
 */
App._embedIni = function(){
  this.mode = 'embed';
  // Remove any element from APP
  $('header, footer, nav').remove();
  $('body').attr('mode',this.mode);
  this.auth = new App.Auth();
  this.router = new App.Router();
  Backbone.history.start({ pushState: true, root: '/' + App.lang + '/' });
}

// Associate the 'APP' events with the 'Backbone' events
App.events = {};
_.extend(App.events , Backbone.Events);

/**
 * Detect language analyzing the URL
 * @returns {String} - current lang
 */
App.detectCurrentLanguage = function() {
  var url = document.URL.replace('/#','/');

  if (url.indexOf('/es/') != -1 || url.endsWith('/es')) {
    return 'es';
  } else if (url.indexOf('/en/') != -1 || url.endsWith('/en')) {
    return 'en';
  } else if (url.indexOf('/it/') != -1 || url.endsWith('/it')) {
    return 'it';
  } else if (url.indexOf('/fr/') != -1 || url.endsWith('/fr')) {
    return 'fr';
  } else if (url.indexOf('/de/') != -1 || url.endsWith('/de')) {
    return 'de';
  } else {
    return 'es';
  }
};

/**
 * Draw the current view into the "main" DOM element
 * @param {Object} view - Object type "Backbone.View"
 */
App.showView = function(view) {
  var oldView = this.currentView;

  this.currentView = view;
  this.$main.html(view.el);

  if (view.onAttachToDOM) {
    view.onAttachToDOM();
  }

  if (oldView) {
    oldView.close(); // --> "Backbone.View.prototype.close"
  }

  this.scrollTop();
};

/**
 * Close the current View
 */
App.closeCurrentView = function (){
  if (this.currentView){
    this.currentView.close();
    this.currentView = null;
  }
};

/**
 * Move the window scroll to top
 */
App.scrollTop = function($el) {
  $('html, body').animate({
    scrollTop: typeof $el !== 'undefined' ? $el.offset().top : 0
  }, 500, 'swing');
}

/**
 * Alias from 'scrollTop' to "$el" elements
 */
App.scrollToEl = function($el) {
  App.scrollTop($el)
}

/**
 * Change the characters '\n' by '<br>'
 * 
 * @param {String} str - string to change
 * @param {Boolean} is_xhtml - is Document XHTML?
 * @return {String} - string changed
 */
App.nl2br = function nl2br(str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

/**
 * Change date format (with time)
 * 
 * @param {Object} - Date object
 * @param {String} - Date format
 * @return {String} - Formatted date
 */
App.formatDateTime = function(date, format){
  if (typeof format === 'undefined') {
    format = 'DD/MM/YYYY - HH:mm';
  }
  return moment.utc(date).local().format(format);
}

/**
 * Change date format
 * 
 * @param {Object} - Date object
 * @param {String} - Date format
 * @return {String} - Formatted date
 */
App.formatDate = function(date, format) {
  if (typeof format === 'undefined') {
    format = 'DD/MM/YYYY';
  }
  return moment.utc(date).local().format(format);
}

App.slug = function(str) {
  var $slug = '';
  var trimmed = $.trim(str);
  $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
  replace(/-+/g, '-').
  replace(/^-|-$/g, '');
  return $slug.toLowerCase();
}

App.tr = function(key){
  if (this.locales && this.locales.hasOwnProperty(key)){
    return this.locales[key];
  }
  else{
    return key;
  }
}

/* number format*/
App.nbf = function (n, options){
  var default_opts = {
    decimals: 2,
    compact: true,
    compactK: false
  };
  options = options || {};

  // Retrocompatibility (safe to delete when all nbf are migrated)
  if(!isNaN(parseInt(options))){
    options = {
      decimals: options
    };
  }

  _.defaults(options,default_opts);

  /* var lang = App.lang || 'de-DE'; */
  // Force format
  var lang = 'de-DE';
  if (n===null){
      return "--";
  }

  if (isNaN(n)){
    return n;
  }
  else{
    n = parseFloat(n);
    if(options.compact){
      if(n > 1000000){
        n = n / 1000000;
        return parseFloat(n.toFixed(options.decimals)).toLocaleString(lang,{maximumFractionDigits: options.decimals}) + "M";
      }
      else if(options.compactK && n > 1000){
        n = n / 1000;
        return parseFloat(n.toFixed(options.decimals)).toLocaleString(lang,{maximumFractionDigits: options.decimals}) + "K";
      }
      else{
        return parseFloat(n.toFixed(options.decimals)).toLocaleString(lang,{maximumFractionDigits: options.decimals});
      }
    }else{
      return parseFloat(n.toFixed(options.decimals)).toLocaleString(lang,{maximumFractionDigits: options.decimals});
    }
  }
}

App.getSensorVariableColor = function(key){
  return availableColors[key];
}

App.getSensorVariableColorList = function(){
  return availableColors;
}

App.getAggStr = function(agg){
  agg = agg.toLowerCase();
  if (agg=='avg')
    return __('medio');
  else if (agg=='sum')
    return __('total');
  else if (agg=='min')
    return __('mínimo');
  else if (agg=='max')
    return __('máximo');
  else
    return '';
}

App.getPictureAgg = function(agg){
  agg = agg.toLowerCase();
  if (agg=='avg')
    return '/img/SC_ic_agrega_med.svg';
  else if (agg=='sum')
    return '/img/SC_ic_agrega_total.svg';
  else if (agg=='min')
    return '/img/SC_ic_agrega_min.svg';
  else if (agg=='max')
    return '/img/SC_ic_agrega_max.svg';
  else
    return '';
}

App.timeunitToStr = function(timeunit){
  if (timeunit=='last8h')
    return 'Últimas 8 horas';
  else if (timeunit=='last12h')
    return 'Últimas 12 horas';
  else if (timeunit=='last24h')
    return 'Últimas 24 horas';
  else if (timeunit=='last3day')
    return 'Últimos 3 días';
  else if (timeunit=='lastweek')
    return 'Última semana';
  else if (timeunit=='lastmonth')
    return 'Último mes';
}

App.stepToStr = function(timeunit){
  if (timeunit=='7d')
    return __('1 Semana');
  else if (timeunit=='3d')
    return __('3 Días');
  else if (timeunit=='2d')
    return __('2 Días');
  else if (timeunit=='1d')
    return __('1 Día');
  else if (timeunit=='12h')
    return __('12 Horas');
  else if (timeunit=='1h')
    return __('1 Hora');
  else if (timeunit=='2h')
    return __('2 Horas');
  else if (timeunit=='4h')
    return __('4 Horas');
  else if (timeunit=='30m')
    return __('30 minutos');
  else if (timeunit=='15m')
    return __('15 minutos');
}

App.scopeOptionsToStr = function(scopeOption) {
  if(scopeOption == 'multi') {
    return __('Multiámbito');
  } else if(scopeOption == 'unico') {
    return __('Ámbito (único)');
  } else if(scopeOption == 'todos') {
    return __('Todos los tipos');
  } else {
    return '';
  }
}

App.nextTimeMinutes = function (d){
  return parseInt((new Date().getTime() - new Date(d).getTime()) /(1000*60));
}

App.circleLoading = function(){
  return _.template($('#loading-loading_template').html())({'classed':'circle'});
}

App.mapLoading = function(){
  return _.template($('#loading-loading_template').html())({'classed':'map'});
}

App.widgetLoading = function(){
  return _.template($('#loading-loading_template').html())({'classed':'widgetL'});
}

App.getMetadata = function(){
  return this._metadata;
}

// Just a shorthand
App.mv = App.getMetadata;

App.getUser = function(){
  return this._user;
}

App.getNavBar = function(){
  return this._navigationBarModel;
}

App.getFilter = function(id_category){
  return this._filters[id_category];
}

App.setFilter = function(id_category,model){
  this._filters[id_category] = model;
}

App._updateFavicon = function() {
  $("link[rel='apple-touch-icon']").each(function(index, element) {
    element.setAttribute('href',(App.config.pathFavicon || '') + '/img/favicons/apple-icon-' + element.getAttribute('sizes') + '.png');
  });

  var favicons = $("link[rel='icon']").each(function(index, element) {
    if (element.getAttribute('sizes') !== '192x192') {
      element.setAttribute('href',(App.config.pathFavicon || '') + '/img/favicons/favicon-' + element.getAttribute('sizes') + '.png');
    } else {
      element.setAttribute('href',(App.config.pathFavicon || '') + '/img/favicons/android-chrome-192x192.png');
    }
  });

  $("link[rel='manifest']").attr('href',(App.config.pathFavicon || '') + '/img/favicons/manifest.json');
}

/**
 * Reduce the size a string
 * 
 * @param {String} value - string to parser
 * @returns {String} - parsed string
 */
App.reduceString = function(value) {
  var l = value.length;
  if(l > 22){
    return value.substring(0,7) + '...' + value.substring(l-12,l);
  }
  return value;
}

/**
 * Differents format to lib d3 (stats)
 */
App.d3Format = d3.locale({
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["$", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%m/%d/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

// Click invoker for d3 from jQuery
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

// TODO: Put wherever it must go
// This is a hack to truly center the No Data message on charts
nv.utils.noData = function(chart, container) {
  var opt = chart.options(),
      noData = opt.noData(),
      data = (noData == null) ? ["No Data Available."] : [noData];

  //Remove any previously created chart components
  container.selectAll('g').remove();
  //Remove custom legend
  $(container[0]).siblings('.var_list').addClass('hide');

  var noDataText = container.selectAll('.nv-noData').data(data);

  noDataText.enter().append('text')
      .attr('class', 'nvd3 nv-noData')
      .style('text-anchor', 'middle');

  noDataText
      .attr('x', '50%')
      .attr('y', '50%')
      .text(function(t){ return t; });
};

/**
 * Is triggered when the DOM is loaded
 */
$(function() {

  /**
   * Handler to be called when Ajax requests complete with an error
   */
  $(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status == 403 || jqxhr.stats == 401) {
      App.auth.logout();
      App.router.navigate('login',{trigger: true});
    }
  });

  /**
   * Event triggered when 'click' on any tag 'a' and
   * it has the attributte 'jslink' to navigate between
   * sections the APP
   */
  $('body').on('click', 'a', function (e){
    var attr = $(this).attr('jslink');
    var href = $(this).attr('href');
    var blank = $(this).attr('target') === '_blank';

    if (blank) {
      if (!href.includes('/' + App.lang + '/'))
        $(this).attr('href', '/' + App.lang + href);
      return;
    }

    //Prevent update url history when clicking a link to the current page
    if (href && href.slice(1)  === Backbone.history.getFragment()) { 
      e.preventDefault();
      return;
    }

    if (attr !== undefined && attr !== 'undefined'){
      e.preventDefault();

      if (href === '#back') {
        history.back();
      }

      if (attr) {
        App.getNavBar().set('backurl', attr);
      } else {
        App.getNavBar().set('backurl', Backbone.history.getFragment());
      }

      App.router.navigate(href, { trigger: true });
    }
  });

  if (location.hash) {
    history.pushState({}, 'entry page', location.hash.substring(1));
  } else if (location.pathname === '/') {
    history.pushState({}, 'entry page', 'es/home');
  }

  // Init the application
  App.ini();
});