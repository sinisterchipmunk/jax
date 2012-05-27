//= require "jax/core/base"
//= require "jax/compatibility"
//= require "jax/core"
//= require "jax/webgl/core"
//= require "jax/anim_frame"
//= require "jax/prototype/extensions"
//= require "jax/mvc/model"
//= require "jax/mvc/controller"
//= require "jax/mvc/view_manager"
//= require "jax/mvc/route_set"
//= require "jax/mvc/view"
//= require "jax/context"
//= require "jax/mesh"
//= require "jax/noise"
//= require "jax/builtin/all.js"
//= require "jax/shader"
//= require "jax/material"
//= require "jax/world"

//= require_self
//= require "jax/core/deprecation"

Jax.shaders = {};
Jax._shader_data = {};

Jax.import_shader_code = function(shader_name, shader_type) {
  var constant_name = "__import_"+shader_name+"_"+shader_type+"__";
  return "#ifndef "+constant_name+"\n" +
         "#define "+constant_name+" 1\n" +
           Jax.shader_data(shader_name)[shader_type] +
         "#endif\n"
};

// Finds or creates the named shader descriptor in +Jax.shaders+. This is used by
// `Jax::Shader` in Ruby.
Jax.shader_data = function(name) {
  Jax._shader_data[name] = Jax._shader_data[name] || {"name":name};
  return Jax._shader_data[name];
};

/**
 * Jax.views -> Jax.ViewManager
 **/
Jax.views = new Jax.ViewManager();

/**
 * Jax.routes -> Jax.RouteSet
 **/
Jax.routes = new Jax.RouteSet();

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

/**
 * Jax.shutdown() -> undefined
 *
 * Causes all Jax contexts to be disposed.
 **/
Jax.shutdown = function() {
  Jax.SHUTDOWN_IN_PROGRESS = true;
};

/**
 * Jax.restart() -> undefined
 *
 * Restarts the Jax subsystem after a prior call to Jax.shutdown().
 **/
Jax.restart = function() {
  Jax.SHUTDOWN_IN_PROGRESS = false;
};

// start 'er up!
Jax.restart();

/*
  FIXME Resource manager looks for an object in the global namespace, so using Jax.Scene.LightSource
  instead of just LightSource results in a broken resource load.
 */
var LightSource = Jax.Scene.LightSource;
var Material = Jax.Material;


/* Export globals into 'exports' for CommonJS */
if (typeof(exports) != "undefined") {
  exports.Jax = Jax;
  exports.mat4 = mat4;
  exports.mat3 = mat3;
  exports.vec3 = vec3;
  exports.glMatrixArrayType = glMatrixArrayType;
  exports.quat4 = quat4;
}
