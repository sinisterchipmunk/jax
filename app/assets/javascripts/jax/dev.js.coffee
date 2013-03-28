#= require_self
#= require_tree ./dev

Jax.Dev or=
  Views: {}
  Models: {}
  Collections: {}
  Templates: {}

$ ->
  router = new Jax.Dev.Router
  Backbone.history.start()
