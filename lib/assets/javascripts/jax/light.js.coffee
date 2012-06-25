#= require_self
#= require_tree "./light"

Jax.POINT_LIGHT       = 1
Jax.SPOT_LIGHT        = 2
Jax.DIRECTIONAL_LIGHT = 3

class Jax.Light extends Jax.Model
  constructor: (options) ->
    if @.__proto__.constructor.name == 'Light' # not a subclass of Light
      if options?.type
        # Handle legacy light types
        switch options.type
          when "SPOT_LIGHT", Jax.SPOT_LIGHT then options.type = "Spot"
          when "POINT_LIGHT", Jax.POINT_LIGHT then options.type = "Point"
          when "DIRECTIONAL_LIGHT", Jax.DIRECITONAL_LIGHT then options.type = "Directional"
        if Jax.Light[options.type] then return new Jax.Light[options.type](options)
    
    @shadows = true
    @enabled = true
    @_color = new Jax.Light.Color
    @_attenuation = new Jax.Light.Attenuation
    @spotExponent = 32
    @innerSpotAngle = Math.PI / 8.75
    @outerSpotAngle = Math.PI / 8
    @energy = if options?.energy is undefined then 1 else options.energy
    
    super options
    
  @define 'color',
    get: -> @_color
    set: (c) -> @_color = new Jax.Light.Color c
    
  @define 'attenuation',
    get: -> @_attenuation
    set: (options) -> @_attenuation = new Jax.Light.Attenuation options
    
  @define 'direction',
    get: -> @camera.direction
    set: (dir) -> @camera.setDirection dir

  @define 'position',
    get: -> @camera.position
    set: (pos) -> @camera.setPosition pos
    
  @define 'innerSpotAngle',
    get: -> @_innerSpotAngle
    set: (c) -> @_innerSpotAngle = c; @_innerSpotAngleCos = Math.cos c
    
  @define 'outerSpotAngle',
    get: -> @_outerSpotAngle
    set: (c) -> @_outerSpotAngle = c; @_outerSpotAngleCos = Math.cos c

  @define 'outerSpotAngleCos', get: -> @_outerSpotAngleCos
  @define 'innerSpotAngleCos', get: -> @_innerSpotAngleCos
  
  ###
  Returns true if the specified model is close enough to this light
  source to be at least partially illuminated by it. This does not 
  indicate whether or not the model is in shadow, which is a much
  more time-consuming calculation performed by
  `Jax.ShadowMap#isIlluminated`.
  ###
  isInRange: (model) ->
    radius = model.mesh?.bounds.radius || 0
    # My first thought was to exit early on 0-radius meshes since they're
    # invisible, but this would be a bad idea because some models contain
    # other models instead of meshes...
    objPos = model.position
    dist = vec3.length(vec3.subtract objPos, @position) - radius
    range = @maxEffectiveRange()
    return range is -1 or range >= dist

  dispose: (context) ->
    this.shadowmap?.dispose context
  
  rotate: (amount, axisX, axisY, axisZ) -> @camera.rotate amount, axisX, axisY, axisZ

  eyeDirection: (matrix, dest) ->
    vec3.normalize mat3.multiplyVec3 matrix, @camera.direction, dest
    
  eyePosition: (matrix, dest) ->
    mat4.multiplyVec3 matrix, @camera.position, dest

  crMinIntensity = 10.0 / 256.0
  maxEffectiveRange: (rangeIncrement = 1.0) ->
    attenuation = @attenuation
    
    # make sure the parameters are reasonable and that
    # the algorithm will terminate
    if attenuation.constant < 0.0 or attenuation.linear < 0.0 or attenuation.quadratic < 0.0 or \
       (attenuation.constant < (1 / crMinIntensity) and attenuation.linear is 0 and attenuation.quadratic is 0)
      return -1

    distance = rangeIncrement
    while @calculateIntensity(distance) > crMinIntensity
      distance += rangeIncrement

    distance
    
  calculateIntensity: (distance) ->
    return 1.0 / (@attenuation.constant + @attenuation.linear * distance + \
                  @attenuation.quadratic * distance * distance);

# For legacy compatibility
# TODO remove these
Jax.Scene or= {}
Jax.Scene.LightSource = Jax.Light
