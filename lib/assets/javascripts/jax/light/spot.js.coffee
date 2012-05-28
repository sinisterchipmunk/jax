class Jax.Light.Spot extends Jax.Light
  constructor: (options) ->
    super options
    @type = Jax.SPOT_LIGHT
    @position = vec3.create()
    @direction = vec3.create [0, -1, 0]
