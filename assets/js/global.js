window.$ = require('jquery');
window.AmpersandView = require('ampersand-view');

// ---------------------------------------------------
// Plugin stuff
// ---------------------------------------------------

$.each( [ "patch", "delete" ], function( i, method ) {
  $[ method ] = function( url, data, callback, type ) {
    if ( $.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }
    return $.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});
