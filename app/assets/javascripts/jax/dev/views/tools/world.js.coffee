class Jax.Dev.Views.Tools.World extends Backbone.View
  template: JST['jax/dev/tools/world']

  initialize: ->
    @jax = @options.context
    @render()

  render: =>
    @$el.html @template()
    @$("#ambient-color").append new Jax.Dev.Views.ColorPicker(
      id: "ambient-color-picker"
      color: @jax.world.ambientColor
    ).$el
