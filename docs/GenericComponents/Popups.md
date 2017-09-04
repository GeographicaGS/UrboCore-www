# Popups

## Code

This feature is currently available in the dev-alvaro-users. It will be in dev soon.

## Explanation

This feature is in charge of inserting a popup in a specific page, with another view inside it. The following files are in relation with this new functionality.

* styles.less
* View/PopUpView.js
* template/pop_up_template.html

Let us consider one particular page will need a popup, showed when one event is triggered, for instance when clicking a button. Hence, in the function that handles the event we need to create
the popup view:

```javascript
if(this._popUpView == undefined) {
	this._popUpView = new App.View.PopUp();
}
```

As necessary issue, in most cases, this popup will have another view inside it, so we have to create it and associate to it in our calling page:

```javascript
var userView = new App.View.User({model : userModel});
this._popUpView.internalView = userView;
```

And finally the popup has to be inserted in the end of the current page:

```javascript
this.$el.append(this._popUpView.render().$el);
```

And finally we have to call to the showing function that makes the popup visible:

```javascript
this._popUpView.show();
```

In short, the complete code snippet in our current page to call to the popup is as follows:

```javascript
var userView = new App.View.User({model : userModel});
if(this._popUpView == undefined) {
   this._popUpView = new App.View.PopUp();
}
this._popUpView.internalView = userView;
this.$el.append(this._popUpView.render().$el);
this._popUpView.show();
```

The remaining issues are transparent for us, because the own popup is in charge of delete the HTML content when closing. The only thing to know is each time you want to show the popup, you have to
create the internal view of the popup, associate it to the popup and render the popup and append it to the current page. The elimination and cleaning of the subviews is done by the popup view.

However it is important to notice that the corresponding elimination of the popup view is responsability of our current page, so in the 'onClose' function:

```javascript
 onClose: function(){
    this.stopListening();

    if(this._popUpView != undefined) {
      this._popUpView.close();
    }
  }
```

Note 1: The functions _show_ and _closePopUp_ existing in PopUpView.js are publics, because perhaps the external views need to call them. In fact, currently _show_ is invoked by the current that includes the popup, but it could be called inside the popup _render_ function.
