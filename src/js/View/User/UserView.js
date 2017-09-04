'use strict';

App.View.User = Backbone.View.extend({

  _template: _.template( $('#user-new_user_template').html() ),

  events: {
    'submit' : 'onFormSubmit',
    // 'change input[type!="submit"]': '_onInputChange',
    // 'blur input[type!="submit"]': '_onInputChange',
    'focus input': function(e) {
        this.resetInputErrors(e.target);
    },
    'click .deleteButton button' : '_deleteUser'
  },

  templates: {
    'error': _.template('<div class="error"><%=error%></div>')
  },

  initialize: function() {
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

  onFormSubmit: function(e) {
    e.preventDefault();
    var model = this.model;

    this.$el.find('input[name]').each(function() {
      if(this.value.trim()) {
        model.set(this.name, this.value);
      }
    });
    //Si estamos editando y el check de cambio de pass no esta habilitado, no se envia a servidor
    if(!this.newUser && !$("input[type='checkbox'].changePassword").is(":checked")) {
      this.model.unset("password");
      this.model.unset("password2");
    }
    if(App.auth.getUser().superadmin) {
      this.model.unset("oldPassword");
    }

    var _thisView = this;

    if(this.model.isValid()) {
      this.model.set("superadmin", $("input[name='superadmin']").is(":checked") ? true : false);

      this.model.save('', '', {
        success : function(model, response) {
          _thisView.collectionUser.add(model);
          _thisView.collectionUser.trigger("reset", _thisView.collectionUser);
          _thisView.popUpView.closePopUp();
        },
        error : function(model, response) {
          _thisView._resetAllInputErrors();
          _.each(response.responseJSON, function(error) {
            _thisView.$el.find("input[name=" + error.param + "]").parent().append(_thisView.templates.error({error : error.msg}));
            _thisView.$el.find("input[name=" + error.param + "]").addClass("inputError");
          });
        }
      });
    }
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

  _deleteUser: function(e) {
    e.preventDefault();
    if (confirm('¿Estás seguro que deseas eliminar este usuario?')) {
      var _thisView = this;
      this.model.destroy({
        success : function(model, response) {
          _thisView.collectionUser.trigger("reset", _thisView.collectionUser);
          _thisView.popUpView.closePopUp();
        },
        error : function(model, response) {
          _thisView._resetAllInputErrors();
        }
      });
    }
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template(this.model.toJSON()));
    if(this.model.get("superadmin")) {
      this.$el.find("input[name='superadmin']").attr("checked", "checked");
    }
    return this;
  },

});
