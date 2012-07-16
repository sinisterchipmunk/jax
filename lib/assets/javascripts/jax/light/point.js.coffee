class Jax.Light.Point extends Jax.Light
  constructor: (options) ->
    super options
    @innerSpotAngle = Math.PI
    @outerSpotAngle = Math.PI
    @type = Jax.POINT_LIGHT
    @shadowmap = new Jax.ShadowMap.Point this
