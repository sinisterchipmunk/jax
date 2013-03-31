#= require_self
#= require_tree "./light"

Jax.POINT_LIGHT       = 1
Jax.SPOT_LIGHT        = 2
Jax.DIRECTIONAL_LIGHT = 3

class Jax.Light extends Jax.Model
  __maxSpotAngle = Math.PI / 2 - Math.EPSILON
  @getMaxSpotAngle: -> __maxSpotAngle

  constructor: (options) ->
    if @.__proto__.constructor.name == 'Light' # not a subclass of Light
      if options?.type
        # Handle legacy light types
        switch options.type
          when "SPOT_LIGHT", Jax.SPOT_LIGHT then options.type = "Spot"
          when "POINT_LIGHT", Jax.POINT_LIGHT then options.type = "Point"
          when "DIRECTIONAL_LIGHT", Jax.DIRECITONAL_LIGHT then options.type = "Directional"
        if Jax.Light[options.type] then return new Jax.Light[options.type](options)
    
    @shadows = false
    @enabled = true
    @_color = new Jax.Light.Color
    @_attenuation = new Jax.Light.Attenuation
    @innerSpotAngle = Math.PI / 4.375
    @outerSpotAngle = Math.PI / 4
    # FIXME should be easy to bind one function to many events
    @attenuation.on 'constantChanged',  => @_maxEffectiveRangeCache = null
    @attenuation.on 'linearChanged',    => @_maxEffectiveRangeCache = null
    @attenuation.on 'quadraticChanged', => @_maxEffectiveRangeCache = null
    
    super options
    
  @define 'color',
    get: -> @_color
    set: (c) -> @_color = new Jax.Light.Color c
    
  @define 'attenuation',
    get: -> @_attenuation
    set: (options) -> @_attenuation = new Jax.Light.Attenuation options
    
  @define 'direction',
    get: -> @camera.direction
    set: (dir) -> @camera.direction = dir

  @define 'position',
    get: -> @camera.position
    set: (pos) -> @camera.position = pos
  
  @define 'innerSpotAngle',
    get: -> @_innerSpotAngle
    set: (c) ->
      @_innerSpotAngle = c
      # If @_innerSpotAngle is 45 degrees, the actual, visible
      # angle of the cone will be 45 degrees only if we divide by 2 here,
      # because the dot product used by the shader produces the same value
      # for both negative and positive angles (where 0 is the center of
      # the cone).
      @_innerSpotAngleCos = Math.cos c / 2
      @trigger 'innerSpotAngleChanged', c
      if @_outerSpotAngle < c
        @outerSpotAngle = c
    
  @define 'outerSpotAngle',
    get: -> @_outerSpotAngle
    set: (c) ->
      @_outerSpotAngle = c
      @_outerSpotAngleCos = Math.cos c / 2
      @trigger 'outerSpotAngleChanged', c
      if @_innerSpotAngle > c
        @innerSpotAngle = c

  @define 'outerSpotAngleCos', get: -> @_outerSpotAngleCos
  @define 'innerSpotAngleCos', get: -> @_innerSpotAngleCos
  
  ###
  Returns true if the specified model is close enough to this light
  source to be at least partially illuminated by it. This does not 
  indicate whether or not the model is in shadow, which is a much
  more time-consuming calculation performed by
  `Jax.ShadowMap#isIlluminated`.
  ###
  inRangeVec = vec3.create()
  isInRange: (model) ->
    radius = model.mesh?.bounds.radius || 0
    # My first thought was to exit early on 0-radius meshes since they're
    # invisible, but this would be a bad idea because some models contain
    # other models instead of meshes...
    objPos = model.position
    dist = vec3.length(vec3.subtract inRangeVec, objPos, @position) - radius
    range = @maxEffectiveRange()
    return range is -1 or range >= dist

  dispose: (context) ->
    this.shadowmap?.dispose context
  
  rotate: (amount, axisX, axisY, axisZ) -> @camera.rotate amount, axisX, axisY, axisZ

  eyeDirection: (matrix, dest) ->
    dest or= vec3.create()
    vec3.normalize dest, vec3.transformMat3 dest, @camera.direction, matrix
    
  eyePosition: (matrix, dest) ->
    vec3.transformMat4 dest, @camera.position, matrix

  crMinIntensity = 10.0 / 256.0
  maxEffectiveRange: (rangeIncrement = 1.0) ->
    return @_maxEffectiveRangeCache if @_maxEffectiveRangeCache
    attenuation = @attenuation
    
    # make sure the parameters are reasonable and that
    # the algorithm will terminate
    # the epsilons are important because very small values can stall the
    # javascript
    if attenuation.constant < Math.EPSILON or attenuation.linear < Math.EPSILON or attenuation.quadratic < Math.EPSILON or \
       (attenuation.constant < (1 / crMinIntensity) and attenuation.linear < Math.EPSILON and attenuation.quadratic < Math.EPSILON)
      return @_maxEffectiveRangeCache = -1

    distance = rangeIncrement
    while @calculateIntensity(distance) > crMinIntensity
      distance += rangeIncrement

    return @_maxEffectiveRangeCache = distance
    
  calculateIntensity: (distance) ->
    return 1.0 / (@attenuation.constant + @attenuation.linear * distance + \
                  @attenuation.quadratic * distance * distance);

# For legacy compatibility
# TODO remove these
Jax.Scene or= {}
class Jax.Scene.LightSource extends Jax.Light
  notice = ->
    console.log 'Please note that Jax.LightSource has been deprecated; it is now just Jax.Light.'
    console.log '(You should also rename `app/assets/jax/resources/light_sources` to ' + \
                '`app/assets/jax/resources/lights`.)'
    
  constructor: (options) ->
    notice()
    super options
    
  @find: ->
    notice()
    Jax.Light.find arguments...
    
  @addResources: ->
    notice()
    Jax.Light.addResources arguments...

Jax.getGlobal().LightSource = Jax.LightSource = Jax.Scene.LightSource
