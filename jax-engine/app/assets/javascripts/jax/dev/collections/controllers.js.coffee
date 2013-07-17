class Jax.Dev.Collections.Controllers extends Backbone.Collection
  initialize: ->
    controllers = []
    controllers.push name: name for name in Jax.routes.getControllerNames()
    @reset controllers
