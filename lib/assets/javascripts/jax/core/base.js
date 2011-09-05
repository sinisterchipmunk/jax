/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = {
  PRODUCTION: 1,
  
  VERSION: "<%=JAX_VERSION%>",
  
  webgl_not_supported_path: "/webgl_not_supported.html",
  
  /**
   * Global
   * Objects and functions defined here are available in the global scope.
   **/
  getGlobal: function() {
    return (function() {
      if (typeof(global) != 'undefined') return global;
      else return window;
    })();
  },
  
  /**
   * Jax.reraise(old_error, new_error) -> error
   * - old_error (Error): the original exception that was raised
   * - new_error (Error): the error to be raised in its place
   *
   * Copies the backtrace from the old error into the new error, if available.
   * Since some browsers do not support assignment to the +stack+ attribute
   * of an error, this is stored in the +_stack+ attribute instead.
   *
   * After the copy has been performed, the new error is thrown
   **/
  reraise: function(original_error, new_error) {
    if (original_error._stack) new_error._stack = original_error._stack;
    else if (original_error.stack) new_error._stack = original_error.stack;
    throw new_error;
  },
  
  /**
   * Jax.click_speed = 0.2
   *
   * Think of an input button. The 'mouse_clicked' event fires after the button has been
   * depressed, regardless of how long the button has been held down. However, in
   * terms of UI events, a "mouse clicked" event generally corresponds to a mouse
   * button press followed by a mouse button release within a relatively short
   * timeframe.
   *
   * In order to prevent 'mouse_clicked' events from interfering with other button-related
   * events, such as 'mouse_dragged', Jax imposes a UI-like click speed. If the
   * 'mouse_clicked' event is not received within this number of seconds from the
   * previous 'mouse_pressed' event, it will be ignored.
   *
   * To revert to HTML-style, button-like clicking, simply set this number to +null+.
   *
   **/
  click_speed: 0.2,
};

// note: the default_shader is used immediately after Jax.Material has been defined. So, most
// likely the end user won't be able to customize it with the expected result. Materials created
// *after* the default shader has been changed are fine, but materials already existing
// (such as "default") will continue to use the previous default. If default material init can be deferred
// until first use (e.g. upon first call to model#render), then we can expose this variable.
// Since materials are generally meant to maintain their own shaders, it may not be desirable to
// expose it in any case.
Jax.default_shader = "basic";
