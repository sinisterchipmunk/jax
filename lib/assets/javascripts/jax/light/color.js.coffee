class Jax.Light.Color
  constructor: (@light) ->
    @diffuse  = new Jax.Color 0.50, 0.50, 0.50, 1
    @specular = new Jax.Color 1.00, 1.00, 1.00, 1
    @ambient  = new Jax.Color 0.05, 0.05, 0.05, 1
    