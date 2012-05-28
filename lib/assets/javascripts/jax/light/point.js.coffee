class Jax.Light.Point extends Jax.Light
  constructor: (options) ->
    super options
    @type = Jax.POINT_LIGHT
    @position = vec3.create()
