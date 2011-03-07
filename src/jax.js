//= provide "prototype"

/* Jax namespace */
var Jax = { };

//= require "jax/prototype_extensions"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"

Jax.views = new Jax.ViewManager();
Jax.loaded = true;
