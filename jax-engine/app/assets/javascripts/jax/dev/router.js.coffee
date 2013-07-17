class Jax.Dev.Router extends Backbone.Router
  initialize: ->
    @workspace = new Jax.Dev.Views.Workspace()
    $("#app").html @workspace.$el

  routes:
    "unit-tests"       : "unitTests"
    "unit-tests/:name" : "unitTests"
    "controllers/:name": "runtime"
    ".*"               : "runtime"

  runtime: (controller) =>
    @_runtime = new Jax.Dev.Views.Runtime
    @_runtime.startController controller if controller
    @workspace.setView @_runtime

  unitTests: (name) =>
    @runtime() unless @_runtime
    window.jax.stopRendering()
    window.jax.stopUpdating()
    new Jax.Dev.Views.Jasmine name: name
