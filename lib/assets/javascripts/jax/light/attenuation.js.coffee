class Jax.Light.Attenuation
  constructor: (@light, defaults) ->
    @constant  = 0
    @linear    = 1
    @quadratic = 0
    if defaults?.length
      [@constant, @linear, @quadratic] = [defaults...]
    else
      @constant  = defaults.constant  if defaults?.constant  isnt undefined
      @linear    = defaults.linear    if defaults?.linear    isnt undefined
      @quadratic = defaults.quadratic if defaults?.quadratic isnt undefined
