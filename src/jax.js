//= provide "prototype"

/* Jax namespace */
var Jax = { };

//= require "jax/prototype_extensions"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"
//= require "jax/route_set"
//= require "jax/view"

Jax.views = new Jax.ViewManager();
Jax.routes = new Jax.RouteSet();
Jax.loaded = true;
