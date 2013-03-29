class Jax.Dev.Views.Tools.Lights extends Backbone.View
  template: JST['jax/dev/tools/light']

  initialize: ->
    @jax = @options.context
    @jax.world.on 'lightAdded', @tainted
    @jax.world.on 'lightRemoved', @tainted
    @render()

  render: =>
    @$el.empty()
    for light in @jax.world.lights
      console.log light
      @$el.append new Jax.Dev.Views.Tools.Lights.Item(
        model: light
      ).$el
    true

  _timeout = null
  tainted: =>
    clearTimeout _timeout if _timeout
    _timeout = setTimeout @render, 10
