class Jax.Light.Point extends Jax.Light
  constructor: (options) ->
    @innerSpotAngle = Math.PI
    @outerSpotAngle = Math.PI
    super options
    @type = Jax.POINT_LIGHT
