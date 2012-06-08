class Jax.Light.Directional extends Jax.Light
  constructor: (options) ->
    super options
    @innerSpotAngle = Math.PI
    @outerSpotAngle = Math.PI
    @type = Jax.DIRECTIONAL_LIGHT
