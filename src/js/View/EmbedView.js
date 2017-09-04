'use strict';

App.View.Embed = Backbone.View.extend({

  _template: _.template( $('#embed_template').html() ),

  events: {
    'submit' : 'onFormSubmit',
    'focus input': function(e) {
        this.resetInputErrors(e.target);
    },
    'click .export-form .popup_middle .first button.publish': 'onFormSubmit',
    'click .export-form .popup_middle .w-action': 'unpublishWidget',
    'click .export-form .popup_title .add': 'onAddWidget'
  },

  templates: {
    'error': _.template('<div class="error"><%=error%></div>')
  },

  initialize: function() {
    this.model = new App.Model.PublishedWidget(this.collection.options.modeldata);
    this.listenTo(this.model, 'invalid', this.onModelInvalid);
  },

  getInput: function(name) {
    return this.$el.find('[name="' + name + '"]');
  },

  onModelInvalid: function(model, errors) {
    var _this = this;
    _.each(errors, function(error, name) {
      _this.showInputErrors(_this.getInput(name), error);
    });
  },

  unpublishWidget: function(e){
    var _this = this;
    var $target = $(e.currentTarget);
    var id = $target.data('id');
    var modeldata = _.findWhere(this.collection.toJSON(), {id: id});
    var model = new App.Model.PublishedWidget(modeldata);

    var msg = __('¿Estás seguro de querer despublicar este widget?');
    if(confirm(msg)) {
      model.destroy({
        url: model.url() + '/' + id,
        success: function(model, response) {
          _this.collection.fetch({
            success: function(a){
              _this.render();
            }
          });
        },
        error: function(model, response) {
          console.log("ERROR");
        }
      });
    }
  },

  onAddWidget: function(e){
    this.model = new App.Model.PublishedWidget(this.collection.options.modeldata);
    this.render();
    this.$('.first').removeClass('inactive');
  },

  onFormSubmit: function(e) {
    e.preventDefault();
    var _this = this;

    this.$el.find('input[name]').each(function() {
      if(this.value.trim()) {
        _this.model.set(this.name, this.value);
      }
    });


    this.model.save('', '', {
      success: function(model, response){
        _this.collection.push(model);
        _this.render();
        _this.model = new App.Model.PublishedWidget(_this.collection.options.modeldata);
      },
      error: function(model, response) {
        console.log(response);
        alert("Id repetido");
      }
    });
  },

  _onInputChange: function(e) {
    this.model.set(e.target.name, e.target.value);
    var result = this.model.validateOne(e.target.name, e.target.value);
    if (result !== true) this.showInputErrors(e.target, result)
  },

  _resetAllInputErrors: function() {
    $("input.inputError").each(function() {
      $(this).removeClass("inputError");
      $(this).parent().find('.error').remove();
    })
  },

  resetInputErrors: function(target) {
    var $target = $(target);
    $target.removeClass('inputError');
    $target.parent().find('.error').remove();
  },

  showInputErrors: function(target, errors) {
    var $target = $(target);
    var errorsHTML = '';

    this.resetInputErrors(target);

    for (var i = 0; i < errors.length; i++) {
        errorsHTML += this.templates.error({error: errors[i]});
    }

    $target.addClass('inputError');
    $target.parent().append(errorsHTML);
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({collection: this.collection.toJSON(), model: this.model.toJSON()}));
    return this;
  },

});
