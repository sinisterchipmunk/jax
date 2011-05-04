/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = { };

// note: the default_shader is used immediately after Jax.Material has been defined. So, most
// likely the end user won't be able to customize it with the expected result. Materials created
// *after* the default shader has been changed are fine, but materials already existing
// (such as "default") will continue to use the previous default. If default material init can be deferred
// until first use (e.g. upon first call to model#render), then we can expose this variable.
// Since materials are generally meant to maintain their own shaders, it may not be desirable to
// expose it in any case.
Jax.default_shader = "basic";

//= require "jax/core"
//= require "jax/anim_frame"
//= require "jax/prototype/extensions"
//= require "jax/view_helper"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"
//= require "jax/route_set"
//= require "jax/view"
//= require "jax/context"

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

// should this really exist? technically, the phong shader supports any number
// of lights, so this is really down to client limitations.
Jax.max_lights = 32;

//= require "jax/builtin/all.js"
