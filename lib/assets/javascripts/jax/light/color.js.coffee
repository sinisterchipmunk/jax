class Jax.Light.Color
  @define 'ambient',
    get: -> @_ambient
    set: (c) -> @_ambient = Jax.Color.parse c

  @define 'diffuse',
    get: -> @_diffuse
    set: (c) -> @_diffuse = Jax.Color.parse c

  @define 'specular',
    get: -> @_specular
    set: (c) -> @_specular = Jax.Color.parse c

  constructor: (defaults) ->
    @diffuse  = new Jax.Color 0.0, 0.0, 0.0, 1
    @specular = new Jax.Color 0.0, 0.0, 0.0, 1
    @ambient  = new Jax.Color 0.0, 0.0, 0.0, 1

    if defaults
      if defaults.length or defaults.toVec4
        @diffuse  = defaults
        @specular = defaults
        @ambient  = defaults
      else
        @diffuse  = defaults.diffuse  if defaults.diffuse  isnt undefined
        @specular = defaults.specular if defaults.specular isnt undefined
        @ambient  = defaults.ambient  if defaults.ambient  isnt undefined
        