class Jax.Light.Color
  constructor: (@light, defaults) ->
    @diffuse  = new Jax.Color 0.5, 0.5, 0.5, 1
    @specular = new Jax.Color 1.0, 1.0, 1.0, 1
    @ambient  = new Jax.Color 0.0, 0.0, 0.0, 1

    if defaults?.length or defaults?.toVec4
      @diffuse  = Jax.Color.parse defaults
      @specular = Jax.Color.parse defaults
      @ambient  = Jax.Color.parse defaults
    else
      @diffuse  = Jax.Color.parse defaults.diffuse  if defaults?.diffuse  isnt undefined
      @specular = Jax.Color.parse defaults.specular if defaults?.specular isnt undefined
      @ambient  = Jax.Color.parse defaults.ambient  if defaults?.ambient  isnt undefined
      