class Jax.Light.Spot extends Jax.Light
  constructor: (options) ->
    super options
    @type = Jax.SPOT_LIGHT
    @shadowmap = new Jax.ShadowMap.Spot this
