class Jax.Light.Attenuation
  @include Jax.EventEmitter

  @define 'constant',
    get: -> @_constant
    set: (v) ->
      @_constant = v
      @trigger 'constantChanged', v
  @define 'linear',
    get: -> @_linear
    set: (v) ->
      @_linear = v
      @trigger 'linearChanged', v
  @define 'quadratic',
    get: -> @_quadratic
    set: (v) ->
      @_quadratic = v
      @trigger 'quadraticChanged', v

  constructor: (defaults) ->
    @constant  = 0
    @linear    = 1
    @quadratic = 0
    if defaults?.length
      [@constant, @linear, @quadratic] = [defaults...]
    else
      @constant  = defaults.constant  if defaults?.constant  isnt undefined
      @linear    = defaults.linear    if defaults?.linear    isnt undefined
      @quadratic = defaults.quadratic if defaults?.quadratic isnt undefined
