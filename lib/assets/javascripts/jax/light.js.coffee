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
    get: -> @camera.getViewVector()
    set: (dir) -> @camera.setDirection dir

  @define 'position',
    get: -> @camera.getPosition()
    set: (pos) -> @camera.setPosition pos
    
  @define 'innerSpotAngle',
    get: -> @_innerSpotAngle
    set: (c) -> @_innerSpotAngle = c; @_innerSpotAngleCos = Math.cos c
    
  @define 'outerSpotAngle',
    get: -> @_outerSpotAngle
    set: (c) -> @_outerSpotAngle = c; @_outerSpotAngleCos = Math.cos c

  @define 'outerSpotAngleCos', get: -> @_outerSpotAngleCos
  @define 'innerSpotAngleCos', get: -> @_innerSpotAngleCos

  rotate: (amount, axisX, axisY, axisZ) -> @camera.rotate amount, axisX, axisY, axisZ

  eyeDirection: (matrix, dest) ->
    vec3.normalize mat3.multiplyVec3 matrix, @camera.getViewVector(), dest
    
  eyePosition: (matrix, dest) ->
    mat4.multiplyVec3 matrix, @camera.getPosition(), dest


# For legacy compatibility
# TODO remove these
Jax.Scene or= {}
Jax.Scene.LightSource = Jax.Light
