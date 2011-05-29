/**
 * Global
 * Objects and functions defined here are available in the global (window) scope.
 **/

/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = { PRODUCTION: 1, VERSION: "<%=JAX_VERSION%>" };

/* Called by Jax applications as of version 0.0.0.5 to alert the user to incomplete upgrades */
Jax.doVersionCheck = function(targetVersion) {
  // don't do this in production cause that would be a Bad Idea
  if (Jax.environment && Jax.environment == Jax.PRODUCTION) return;
  
  if (Jax.VERSION != targetVersion) {
    alert("Jax version mismatch!\n\n" +
          "Your Jax gem is version "+targetVersion+", but the Jax JS library is version "+Jax.VERSION+"!\n\n" +
          "Please run `rake jax:update` at the command line to fix this issue.");
  }
};

// note: the default_shader is used immediately after Jax.Material has been defined. So, most
// likely the end user won't be able to customize it with the expected result. Materials created
// *after* the default shader has been changed are fine, but materials already existing
// (such as "default") will continue to use the previous default. If default material init can be deferred
// until first use (e.g. upon first call to model#render), then we can expose this variable.
// Since materials are generally meant to maintain their own shaders, it may not be desirable to
// expose it in any case.
Jax.default_shader = "basic";

//= require "jax/compatibility"
//= require "jax/core"
//= require "jax/anim_frame"
//= require "jax/prototype/extensions"
//= require "jax/mvc/helper"
//= require "jax/mvc/model"
//= require "jax/mvc/controller"
//= require "jax/mvc/view_manager"
//= require "jax/mvc/route_set"
//= require "jax/mvc/view"
//= require "jax/context"
//= require "jax/noise"

Jax.shaders = {};

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
 * Jax.render_speed -> Number
 * Target number of milliseconds to wait between frames.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 *
 * Defaults to 16, for a target rate of 60 frames per second.
 **/
Jax.render_speed = 16;

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
Jax.uptime_tracker = new Date();

/* TODO: verify : is setInterval better for updates, or should be we using requestAnimFrame? */
setInterval(function() { Jax.uptime = (new Date() - Jax.uptime_tracker) / 1000; }, 33);

//= require "jax/builtin/all.js"

/*
  FIXME Resource manager looks for an object in the global namespace, so using Jax.Scene.LightSource
  instead of just LightSource results in a broken resource load.
 */
var LightSource = Jax.Scene.LightSource;
var Material = Jax.Material;
