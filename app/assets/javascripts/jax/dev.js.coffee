#= require dev/colorpicker
#= require_self
#= require_tree ./dev/mixins
#= require_tree ./dev

Jax.Dev or=
  Views: {}
  Models: {}
  Mixins: {}
  Collections: {}
  Templates: {}

$ ->
  router = new Jax.Dev.Router
  Backbone.history.start()
