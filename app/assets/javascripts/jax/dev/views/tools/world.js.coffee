class Jax.Dev.Views.Tools.World extends Backbone.View
  template: JST['jax/dev/tools/world']

  initialize: ->
    @jax = @options.context
    @render()

  render: =>
    @$el.html @template()
    new Jax.Dev.Views.ColorPicker
      el: @$("#ambient-color")[0]
      label: "Ambient Color"
      color: @jax.world.ambientColor
