class Jax.Dev.Views.Tools.Lights.Spot extends Jax.Dev.Views.Tools.Lights.Item
  spotTemplate: JST['jax/dev/tools/lights/spot']

  render: =>
    super()
    @$el.append @spotTemplate()
    @$("#spot-angles").append new Jax.Dev.Views.Tools.Lights.SpotAngleSlider(
      model: @model
    ).$el
