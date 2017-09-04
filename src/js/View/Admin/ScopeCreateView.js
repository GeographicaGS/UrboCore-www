'use strict';

App.View.Admin.ScopeCreate = Backbone.View.extend({
  _template: _.template( $('#admin-scope_create_template').html() ),

  events: {
    'change input[name=isMultiScope]': '_toggleMultiScope',
    'click .exitButton': '_cancel',
    'submit form': '_submit',
  },

  initialize: function(options){
    this.options = options || {};
    this.render();
  },

  render: function(){
    this.$el.html(this._template({parentScope: this.options.parentScope || null}));
    return this;
  },

  _toggleMultiScope: function(e){
    e.preventDefault();
    if(e.currentTarget.checked){
      this.$('.noMulti input, .noMulti label').attr('disabled', 'disabled').removeAttr('required');
    }else{
      this.$('.noMulti input, .noMulti label').removeAttr('disabled').attr('required', 'required');
    }
  },

  _cancel: function(e){
    e.preventDefault();
    this.trigger('close', {});
  },

  _submit: function(e){
    e.preventDefault();

    // TODO: Save element
    var data = {
      name: e.currentTarget.name.value,
      multi: e.currentTarget.isMultiScope ? e.currentTarget.isMultiScope.checked:false
    };
    if(!data.multi){
      data.location = [
        parseFloat(e.currentTarget.lat.value),
        parseFloat(e.currentTarget.lon.value)
      ];
      data.zoom = parseInt(e.currentTarget.zoom.value);
      // data.db = e.currentTarget.db.value;
    }

    if(this.options.parentScope){
      data.parent_id = this.options.parentScope;
    }

    var _this = this;
    App.mv().createScope(data, {
      success: function(newScope){
        _this.trigger('close', {data: newScope});
      },
      error: function(){
        console.log('Error!');
      }
    })
  },
});
