# Good practices

You have to ensure that you are following the check list below whenever you create classes and rules in CSS:
* When using colors, please choose one of the existing ones in _styles.less_. In [colors section](#colors) you can see the different and current colors used in the project.
* Nest the relationed classes inside the corresponding one, in order to avoid a lot of repeated rules. For instance the following code snippet:

```
.form {
   display:block;
}
.form .input {
   margin: 0;
}
```

can be translated into:

```
.form {
   display:block;
   .input {
      margin: 0;
   }
}
```

* Each rule must be specified in one line, in order to increase the legibility of the code.
* Use the generic functions existing in _styles.less_. You can see the [CSS functions section](#css_functions) with the different useful functions which are defined until now.
* The same practice as previous one with the *existing classes*. For instance, if you need one HTML box with border and background color, perhaps another programmer already created one class with 
that border or that background, hence you can insert the content of one of those two classes:

```
.border {
   border: 1px solid black;
}

.myNewClass {
   .border;
   background-color:white;
}
```

or as another solution, you can only create your new CSS class and use the another one in your HTML element:

```
>>CSS file

myNewClass {
   background-color:white;
}

>>>HTML file

....
<div class="myNewClass border">
</div>
....
```

You can see the most of the existing CSS classes in this project in the [CSS classes section](#css_classes_used_as_functions), but maybe there are not all of them.
* You must nest the properties of each class, keeping on the less standard with _disabled_, _hover_, _first_, _nth_, etc

## <a name="colors">Colors</a>

Let us see the different colors that you have to use when applying CSS styles in your new pages:

![screenshot from 2016-07-31 19 30 51](https://cloud.githubusercontent.com/assets/9820476/17278134/514a1376-5755-11e6-888c-049284b637d8.png)

We have more colors in the _typeColor_ function as well. It accepts one argument called _type_, and according to it we can have another different colors:

![screenshot from 2016-07-31 19 32 21](https://cloud.githubusercontent.com/assets/9820476/17278141/87ca526c-5755-11e6-94f9-5ca502a70cf9.png)

This function stablish one variable called _@typeColor_ and, when invoking _typeColor_ function with the _type_, we have the variable available in our CSS class. For more details, please see the [CSS classes section](#css_classes_used_as_functions).

## Useful components

### Popups with options (vars)

![selection_003](https://cloud.githubusercontent.com/assets/9820476/17435019/4032e61e-5b0e-11e6-86b3-1fa96d580a6b.png)

The corresponding HTML for the popups is below:

```
<a class="popup_widget agg" href="#">_selectedValue_
  	<div class="varsel">
  		<ul data-id="_id_">
  			<%_.each(data,function(v){%>
  				<li data-li="<%=v%>" class="<%=v == _selectedValue_ ? 
                                   'selected':''%>"><%=v%></li>
  			<%})%>
  		</ul>
  	</div>
  </a>
```

We have several useful parameters which can be set by passing arguments to the template using underscore:
* SelectedValue. It is the current selected value, and its name is always printed, even with the popup hidden.
* Id. The identifier for the whole scope. With this, we can have different popups and select each one with this id.
* Data-li. The name to identify a particular element of the list (LI)

As consideration, _data_ can be stablished in any way, in order to set the text (string inside the li tag) and the value (the ID of the li, or in this case the _data-li_

The related CSS is as follows:

```
.popup_widget{
   font-weight: 600;
   color: #00b8c7;
   margin-left: 5px;
   position: relative;
   text-transform: uppercase;
   font-size: 13px;

  &:after{
		content: '';
		display: inline-block;
		margin-left: 3px;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 7px 4px 0;
		border-color: #00b8c7 transparent transparent;
  }

  &:hover{
  	&:after{
	    border-width: 0 4px 7px;
	    border-color: transparent transparent #00b8c7;
  	}
       .varsel{
		opacity: 1;
		pointer-events: all;
		transform: translateY(0);
	}
}
.varsel{
    position: absolute;
    right: 0;
    top: 5px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-5px);
    transition: opacity .25s, transform .25s;
    z-index: 4;
    ul{
	margin-top: 15px;
	border: 1px solid #ccccce;
	background-color: #fff;
	li{
		display: block;
		padding: 0 15px;
	        height: 48px;
		line-height: 48px;
		font-weight: 400;
		font-size: 14px;
		color: #97a1a7;
		border-bottom: 1px solid #eee;
		text-transform: uppercase;
		margin: 0;
		&.selected{
			color: #00b8c7;
			font-weight: 700;
		}
	}
    }
  }
}
```

## <a name="css_classes_used_as_functions">CSS classes used as functions </a>

The following rules could be considered as functions but are defined as classes and stablish one variable which will be used by the CSS class that includes it. For instance, if we need the _humidity_ color in a H4 element of our class:

```
.myNewClass {
   .typeColor(humidity)
   h4{
      background-color: @typeColor;
   }
}
```

### Type color

The class _typeColor_ has different accepted values for its _type_ argument, as explained in the [colors section](#colors), and stablish the _@typeColor_ variable with the corresponding color.

### Type image URL

The class _typeImageURL_ accepts the same types as _typeColor_ but applying the corresponding URL of one image (SVG), and stablish the result in the _@typeImageURL_ variable. For more details, please see the definition of this function in _styles.less_.

### Alert Color

The class _alertColor_ accepts _ok_, _warning_ and _error_ as argument, and stablish the _@alertColor_ variable with a corresponding color.

## <a name="css_functions">CSS functions</a>

The following rules are considered as functions and called by the same way as CSS classes, but the difference is that the functions stablish the properties *directly*, without returning any variable.

### Font weight

The function _fontweight_ gets a specific weight in order to apply it to the _font-weight_ property. The  _font-family_ property is assigned as well.

### Font

The function _font_ can be called with no arguments and invokes the _fontweight_ function with the value 400 by default. If the argument is specified the properties _font-style_ and _font-weight_ are stablished. For more information please see its definition and the different ways to be invoked in _styles.less_

### 
TO BE CONTINUED...
