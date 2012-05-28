class Jax.Light.Directional extends Jax.Light
  constructor: (options) ->
    super options
    @type = Jax.DIRECTIONAL_LIGHT
    @direction = vec3.create [0, -1, 0]
