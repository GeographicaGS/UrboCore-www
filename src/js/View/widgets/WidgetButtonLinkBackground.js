'use strict';

/*
Parameters in model:
{
  'title': '',
  'buttonLink': '',
  'buttonText': '',
  'isExternalLink': true || false,
  'titleLink':''
}
*/

App.View.Widgets.ButtonLinkBackground = App.View.Widgets.ButtonLink.extend({
  _template: _.template( $('#widgets-widget_button_link_background_template').html() ),

});
