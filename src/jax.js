//= provide "prototype"

/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = { };

//= require "jax/prototype_extensions"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"
//= require "jax/route_set"
//= require "jax/view"

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
