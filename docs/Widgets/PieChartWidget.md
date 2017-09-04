# Introduction

A new widget was created in order to be used in any places of the application. The picture shows a particular example:

![selection_004](https://cloud.githubusercontent.com/assets/9820476/17443234/c6a04572-5b39-11e6-9402-e6cae17aec14.png)

# Usage

This new feature is configured as a generic widget named _WidgetPieChart_ and, until now, only one specific widget uses it, named _WidgetFillingOperation_. This specific widget stablishes the template seen in the picture above, and only the title is configured by parameter:

```javascript
this._widgets.push(new App.View.Widgets.Waste.FillingOperation({
       'id_scope':this.scopeModel.get('id_scope'),
       'title':'Operación: Contenedores por niveles de llenado'
     })
);
```

But if we want to use the *generic* widget, we have to do the following steps:

## Create the specific widget 

The default functions are necessary in order to use the pieChart widget correctly:

```javascript
App.View.Widgets.Waste.FillingOperation = Backbone.View.extend({

  initialize: function(options) {
    this.options = options;
    this.render();
  },

  onClose: function(){
    if(this._pieChartView) {
      this._pieChart.close();
    }
    this.stopListening();
  },

  render: function(){
    this._pieChart = new App.View.Widgets.PieChart({model : _NEWMODEL_});
    this.$el.html(this._pieChart.$el);
    return this;
  }
});
```
## Create the model. 

In the corresponding file in _Model_ folder we have to insert the model according to this new specific widget:

```javascript
App.Model.Waste.FillingOperation = Backbone.Model.extend({
  initialize: function(options) {
    this.options = options;
  },
  urlRoot: function(){
    return App.config.api_url + "/" + this.options.scope + '/waste_d/level/summary_classification';
  },
  fetch: function(options) {
    options = options || {};

    var date = App.ctx.getDateRange();
	options['data'] = {
		'start': date.start,
		'finish': date.finish
	};
    return Backbone.Model.prototype.fetch.call(this, options);
  },
  parse: function(response) {
     var result = [];

     for(var obj in response) {
         var element = {};
         element.label = obj;
         element.value = response[obj];
         result.push(element);
      }
     var finalResult = {};
    finalResult.response = result;
    return finalResult;
  }
});
```

This model is important because the definition of *initialize*, *fetch* and *parse* functions and *urlRoot* property are necessary.

## Instantiate this new model (_NEWMODEL_) 

The pieChart widget needs a particular information in order to fill its content data:

```javascript
var fillingOperationModel = new App.Model.Waste.FillingOperation({
      scope:this.options.id_scope,
      img:'/img/SC_ic_contenedor_white.svg',
      title:this.options.title,
      response:[],
      colors: ["#00cc00", "#ff9900", "#ff3300"],
      legend : this._legend_template,
      parseTooltip: function(data) {
        var numberContainers = data.data.value;
        var text = "" + numberContainers + " contenedor";
        if(numberContainers > 1) {
          text += "es";
        }
        var iconClass = data.data.label == 'ok' ? 'good' : data.data.label == 'warning' ? 'moderate' :          
           data.data.label == 'error' ? 'bad' : '';
        return _thisView._popup_template({'text':text, 'iconClass' : iconClass});
      }
    });
```

Let us explain the different fields:
* Scope. Indicates the ID scope for the URL when the model fetches the information on server.
* Img. The path for the icon situated in the middle of the chart, as seen in the picture at the beginning of this section.
* Title. The title of the widget.
* Response. Here we will have the returned data from server, managed in the _parse_ function in the model definition.
* Colors. The correlation of the colors when painting the slices of the pie chart. Notice that the order is important because the first color will be associated to the first data returned by the API server, and so on.
* Legend. The field relationed with the information set at the bottom of the widget. It is usual to provide a template existing in the current view.
* ParseTooltip. A function that returns a template, optionally managed by underscore to fill the information dinamically. This function will be executed each time when the mouse enter in each slice of the pie chart, and the _data_ entry parameter will be the data corresponding to the hovered slice (constructed with the specified format in _parse_ function of the model).
