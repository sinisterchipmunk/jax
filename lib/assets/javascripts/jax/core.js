//= require "jax/vendor"
//= require_self
//= require "jax/env"
//= require "jax/prototype/class"
//= require "jax/prototype/extensions"
//= require_tree './core'
//= require 'jax/mvc'
//= require "jax/mesh"

/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = {
  PRODUCTION: 1,
  
  webgl_not_supported_path: null,
  
  /**
   * Global
   * Objects and functions defined here are available in the global scope.
   **/
  getGlobal: function() {
    var g;
    if (typeof(global) != 'undefined') g = global;
    else g = window;

    Jax.getGlobal = function() { return g; };
    return Jax.getGlobal();
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

(function() {
  var guid = 0;
  Jax.guid = function() { return guid++; };
})();

/* FIXME I'm not even sure whether this is used any more. */
Jax.default_shader = "basic";

Jax.shaders = {};
Jax._shader_data = {};

Jax.import_shader_code = function(shader_name, shader_type) {
  return Jax.shader_data(shader_name)[shader_type];
};

// Finds or creates the named shader descriptor in +Jax.shaders+. This is used by
// `Jax::Shader` in Ruby.
Jax.shader_data = function(name) {
  Jax._shader_data[name] = Jax._shader_data[name] || {"name":name};
  return Jax._shader_data[name];
};

/**
 * Jax.loaded -> Boolean
 * True after Jax has been loaded.
 **/
Jax.loaded = true;

/**
 * Jax.update_speed -> Number
 * Target number of milliseconds to wait between updates.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 *
 * Defaults to 33, for a target rate of 30 updates per second.
 **/
Jax.update_speed = 33;


/**
 * Jax.max_lights -> Number
 *
 * If set, Jax will raise an error whenever more than this number of light sources
 * are activated at one time.
 *
 * By default, there is no limit to the number of lights Jax can support. (This
 * property is undefined by default.)
 **/
Jax.max_lights = undefined;

/**
 * Jax.uptime -> Number
 *
 * The amount of time the Jax subsystem has been running, in seconds. This is updated
 * whether any contexts are active or not. It is used for tracking update intervals
 * and framerates, so that individual Jax contexts are not constantly spawning new
 * Date() instances (which then have to be garbage collected).
 **/
Jax.uptime = 0.0;
