#= require dev/colorpicker
#= require_self
#= require jax/dev/_paths
#= require_tree ./dev/mixins
#= require_tree ./dev

Jax.Dev or=
  Views: {}
  Models: {}
  Mixins: {}
  Collections: {}
  Templates: {}
  Paths: {}

$ ->
  unless window.router
    window.router = new Jax.Dev.Router
    Backbone.history.start()
