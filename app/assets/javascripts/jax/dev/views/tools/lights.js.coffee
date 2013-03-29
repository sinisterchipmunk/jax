class Jax.Dev.Views.Tools.Lights extends Backbone.View
  template: JST['jax/dev/tools/light']

  initialize: ->
    @jax = @options.context
    @render()

  render: ->
    @$el.empty()
    for light in @jax.world.lights
      @$el.append new Jax.Dev.Views.Tools.Lights.Item(model: light).$el
    true