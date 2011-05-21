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
//= require "jax/helper"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"
//= require "jax/route_set"
//= require "jax/view"
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
 **/
Jax.render_speed = 15;

/**
 * Jax.update_speed -> Number
 * Target number of milliseconds to wait between updates.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 **/
Jax.update_speed = 15;


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


//= require "jax/builtin/all.js"

/*
  FIXME Resource manager looks for an object in the global namespace, so using Jax.Scene.LightSource
  instead of just LightSource results in a broken resource load.
 */
var LightSource = Jax.Scene.LightSource;
var Material = Jax.Material;
