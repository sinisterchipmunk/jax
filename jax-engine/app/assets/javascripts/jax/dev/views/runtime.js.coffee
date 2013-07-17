class Jax.Dev.Views.Runtime extends Backbone.View
  initialize: ->
    @controllers = new Jax.Dev.Views.ControllerList
      collection: new Jax.Dev.Collections.Controllers
    @jasmine = new Jax.Dev.Views.Jasmine
    @canvas = new Jax.Dev.Views.WebGLCanvas
    @tools = new Jax.Dev.Views.Tools context: @canvas.jax
    @render()

  startController: (name) =>
    @canvas.startController name

  render: =>
    @$el.empty()
    @$el.append @controllers.$el
    @$el.append @jasmine.$el
    @$el.append @tools.$el
    @$el.append @canvas.$el
