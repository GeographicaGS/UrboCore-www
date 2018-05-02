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

(function(){

  var auth = function(){

    this._renewGapSeconds = 120;

    try{
      this._data = JSON.parse(localStorage.getItem('auth')) || {};
    }
    catch(err){
      this._data = {};
    }
  };

  auth.prototype.start = function(cb){
    if (!this.isLogged())
      // go to login
      return cb(false);

    // The user has logged and we've some data from him. Let's check it out.
    var diff = parseInt((new Date(this._data.expires) - new Date()) / 1000);
    if (diff < this._renewGapSeconds){
      // remove token
      this.logout();
      cb(false);
    }
    else{
      this.setRenewer();
      cb(true);
    }
  }

  auth.prototype.isLogged = function(){
    return ! _.isEmpty(this._data);
  }

  auth.prototype.refreshPermissionGraph = function(){
    var _this = this;
    $.ajax(App.config.api_url + '/auth/user/graph',{
      headers:{
        'X-Access-Token': this.getToken()
      }
    })
    .done(function( data, textStatus, jqXHR ) {

      _this._data.graph = _this._graphToTree(data);
      _this.save();
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      console.error('Cannot refresh premission graph');
    });
  }

  auth.prototype._getChilds = function(node,data){
    var r = [];
    var childs = _.where(data,{parent: node.id});

    for (var i in childs){
      r.push(this._getChilds(childs[i],data));
    }

    return {
      'name' : node.name,
      'write' : node.write,
      'read' : node.read,
      'childs' : r
    };
  }

  auth.prototype._graphToTree = function(data){
    return this._getChilds(data[0],data);
  }

  auth.prototype.logout = function(){
    localStorage.removeItem('auth');
  }

  auth.prototype.getToken = function(){
    return this._data.token;
  }

  auth.prototype.getUser = function(){
    return this._data.user;
  }

  auth.prototype.setRenewer = function(){
    this.refreshPermissionGraph();
    var diff = new Date(this._data.expires) - new Date();
    var _this = this;
    setTimeout(function(){
      console.log('Token auto renew');
      _this.login(_this._data.user.email,_this._data.password);
    },diff-this._renewGapSeconds*1000);
  }

  auth.prototype.save = function(){
    localStorage.setItem('auth',JSON.stringify(this._data));
  }

  auth.prototype.oauthLogin = function (token,expires, cb) {
    var _this = this;
    $.ajax(App.config.api_url + '/auth/user/graph_oauth',{
      method: 'GET',
      data: {
        "access_token": token
      }
    }).done(function(data) {
      _this._data = data;
      _this._data.token = token;
      _this._data.expires = expires;
      _this._data.password = '';
      _this._data.graph = _this._graphToTree(data.graph);
      _this.save();
      if (cb) cb();
    });
  }

  auth.prototype.login = function(email,password,cb){

    var _this = this;
    $.ajax(App.config.api_url + '/auth/token/new',{
      method: 'POST',
      data: {
        "email" : email,
        "password" : password
      }
    })
    .done(function( data, textStatus, jqXHR ) {
      //console.log('Login completed');
      _this._data = data;
      _this._data.password = password;
      _this._data.graph = _this._graphToTree(data.graph);
      _this.save();
      _this.setRenewer();
      if (cb) cb();
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      if (cb) cb(jqXHR);
    });
  }

  auth.prototype.getUser = function(){
    return this._data.user;
  }

  auth.prototype._getNodePlainChilds = function(node,list){

    for (var i in childs){
      this._getNodePlainChilds(node)
    }
    delete node.childs;
    list.push(node);
  }

  auth.prototype._searchValidElements = function(opts,node){
    var valids = [],
      ops = opts.ops;

    for (var i in ops){
      if (node[ops[i]] && opts.elements.indexOf(node.name)!=-1){
        valids.push(node.name);
      }
    }

    for (var i in node.childs){
      var childvalids = this._searchValidElements(opts,node.childs[i]);
      valids = valids.concat(childvalids);
    }

    return valids;

  }

  /**
    - opts{
      scope: <scope>,
      elements: [element1,element2]
      ops: ['read','write']. Default to ['read']
    }
  */
  auth.prototype.validElements = function (opts){
    opts.ops = opts.ops || ['read'];
    // find the scope node
    var scopenode = _.findWhere(this._data.graph.childs,{name: opts.scope});
    // get all validElements
    return this._searchValidElements(opts,scopenode);
  }

  App.Auth = auth;

})()

// Store "old" sync function
var backboneSync = Backbone.sync

// Now override
Backbone.sync = function (method, model, options) {
  var disableCheck = model.__disableBackboneSyncInterceptor;
  var disableInterceptor = typeof disableCheck === 'function' ? disableCheck() : disableCheck;
  if(!disableInterceptor) {
    if(App.mode !== 'embed'){
      options.headers = {
        'X-Access-Token': App.auth.getToken(),
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE1MjYyNTc2NzZ9.DTItdunTahmct1yK2uyPKG2WGRvK8R31iLMI1h9V4-0'
      }
  
      // DeMA integration
      if(App.config.with_dema) {
        options.headers['DeMA-Access-PSK'] = App.config.with_dema;
      }
  
  
    } else {
      // Enrich object with query data
      var qparams = App.Utils.queryParamsToObject();
      var token = qparams.access_token_public;
  
      if(options.data) { // POST
        options.data = atob(qparams.b);
        options.headers = {
          'X-Access-Token-Public': token
        }
      }
      else { // GET
        options.data = {"access_token_public": token}
      }
    }
  }

  // call the original function
  backboneSync(method, model, options);
};
