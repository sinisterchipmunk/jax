class Jax.Dev.Router extends Backbone.Router
  initialize: ->
    @workspace = new Jax.Dev.Views.Workspace()
    $("#app").html @workspace.$el

  routes:
    "controllers/:name": "runtime"
    ".*"               : "runtime"

  runtime: (controller) ->
    runtime = new Jax.Dev.Views.Runtime
    runtime.startController controller if controller
    @workspace.setView runtime
