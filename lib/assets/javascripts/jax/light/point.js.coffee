class Jax.Light.Point extends Jax.Light
  constructor: (options) ->
    super options
    @innerSpotAngle = Math.PI * 2
    @outerSpotAngle = Math.PI * 2
    @type = Jax.POINT_LIGHT
    @shadowmap = new Jax.ShadowMap.Point this
