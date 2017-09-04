# Introduction

A new architecture for the widgets of the application was created, following the schema below:

![selection_008](https://cloud.githubusercontent.com/assets/9820476/17807206/6f27d046-6609-11e6-8fb4-086efcf5d3f4.png)


As shown in the picture, we have different concepts here:
* Components. WidgetContext, WidgetInfo and WidgetRealTime are components, used by WidgetBase.
* Main schema for the views. All basics widgets inherit from WidgetBase, in order to keep a common design and attributes.
* WidgetBase is in charge of creating the components and rendering them. Of course it will close them.

# How to create a new basic widget

If we want to create a basic widget which will be used in other places of the application, (like pie chart, stacked) we have to inherit the _widget base_ as follows:

```javascript
App.View.Widgets.PieChart = App.View.Widgets.Base.extend({
....
```

Now we have available the basic template (_this.\_template_) and the render functions for the different components. Hence, the basic template will need several fields:
* Title. This is the title that the widget will have.
* Link. If provided, the box containing the widget will be a link to the location indicated in this parameter.

# How to use a component

The first step is that our widget inherits the WidgetBase in order to use the different components.

On the other hand we need to specify one model in our widget and provide it aditional data, useful for the component. Once we provide this data we need to create it.

Let us see the different components existing until now.

## Info component

If for example we want to use the WidgetInfo component in our widget , we need to build one model with the corresponding data:

```javascript
var model = new Backbone.Model({
        mainView: this.$('.widget.pieChart'),
        viewToHide:this.$(".widget_content"),
        botonLocationView:this.$(".botons"),
        contentTemplate: this.info.template({})
      });
```

* ContentTemplate. This is the template for the information content. The value will be the HTML in a string format, using the _template_ function as follows:

```javascript
....
....
contentTemplate: this.info.template({})
....
```

* Mainview. This is the DOM element where the __content will displayed__. Most of the cases this content will append to the DOM where the chart (SVG) is.
* ViewToHide. This is the DOM element which __will be hide__ when the information data will display. It may be the same as _mainView_ but not necessarily.
* BotonLocationView. The DOM corresponding to the buttons of the widget. 

When the model is created the render function is called in the parent class, WidgetBase:

```javascript
this._renderInfoComponent(model);
```

Finally the component is created and included in our widget. In a transparent way, the information button appears in our _botonLocationView_ and has the behavior to show the _contentTemplate_ inserted in the _mainView_ and hide the _viewToHide_. When the information data is displayed, the information icon is transformed into a __close icon__, to show the _viewToHide_ and hide the _contentTemplate_ again, and so on.

## Context component

This is the component corresponding to the date box situated in the right above corner of the page:

![selection_007](https://cloud.githubusercontent.com/assets/9820476/17799758/91dd8be8-65dd-11e6-823b-3523b0a702b0.png)

Everywhere we want to use the context in order to __listen__ when this data will change, we must include the initialization of the component, implemented in the parent class:

```javascript
this.initContextComponent(model);
```

The model attribute is optional, and if it is provided, we must give the _handlerFunction_ and _view_ (our widget):

```javascript
var model = new Backbone.Model({
      onChangeContext:function(){
        this.model.fetch({success:this._onModelFetch});
        this.render();
      },
      view:this
    });
```

Otherwise if the model is not provided, the default behavior is to __fetch__ the model of the current view/ widget of the collection. For more information, please see the WidgetContext file for more information.

## Date component

This is the component indicating the start and end selected date:

![selection_010](https://cloud.githubusercontent.com/assets/9820476/17884924/25fea2a4-691b-11e6-826b-5a84b2286792.png)

If we want to include it, we have to call to the render existing in our parent widget base:

```javascript
var model = new Backbone.Model({
        botonLocationView:this.$(".botons")
      });
      this._renderDateComponent(model);
```

and of course, providing the DOM element of the bottoms location.
