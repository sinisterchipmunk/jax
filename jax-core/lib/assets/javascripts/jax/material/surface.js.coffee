class Jax.Material.Surface extends Jax.Material.Custom
  $ -> Jax.Material.Surface.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/main/surface/common']
    vertex:   Jax.shaderTemplates['shaders/main/surface/vertex']
    fragment: Jax.shaderTemplates['shaders/main/surface/fragment']

  @define 'intensity',
    get: -> @_intensity
    set: (obj) ->
      intensity = @_intensity
      if typeof(obj) is 'number'
        intensity.ambient  = intensity.diffuse  = intensity.specular = obj
      else
        intensity.ambient  = obj.ambient  if obj.ambient  isnt undefined
        intensity.diffuse  = obj.diffuse  if obj.diffuse  isnt undefined
        intensity.specular = obj.specular if obj.specular isnt undefined
  
  @define 'color',
    get:       -> @_color
    set: (obj) -> @_color.setAll obj
        
  @define 'shininess',
    get: -> @_shininess
    set: (s) ->
      @_shininess = s

  @define 'pcf',
    get: -> @_pcf
    set: (s) -> @_pcf = s

  constructor: (options, name) ->
    @_color = new Jax.Color.Group 'diffuse', 'ambient', 'specular'

    # FIXME These should probably become classes.
    @_intensity = {}
    mat = this
    Object.defineProperty @_intensity, 'ambient',
      get:     -> @_ambient
      set: (i) -> @_ambient = i
    Object.defineProperty @_intensity, 'diffuse',
      get:     -> @_diffuse
      set: (i) -> @_diffuse = i
    Object.defineProperty @_intensity, 'specular',
      get:     -> @_specular
      set: (i) -> @_specular = i

    options or= {}
    options.intensity = 1      if options.intensity is undefined
    options.color     = '#fff' if options.color     is undefined
    options.shininess = 60     if options.shininess is undefined
    options.pcf       = true   if options.pcf       is undefined
    super options, name

    # @addLayer 'ShadowMap'
    # # Important: light ambient comes after shadow map so that ambient values
    # # are not reduced by "shadows"!
    # @addLayer 'Attenuation'
    # @addLayer 'ClampColor'

    # if options
    #   if options.textures
    #     for texture in options.textures
    #       @addLayer type: 'Texture', texture: texture
    #   if options.normalMaps
    #     for map in options.normalMaps
    #       # Normal maps must come before diffuse or specular shaders so that they
    #       # can perturb the normal before it's used to generate colors.
    #       @insertLayer 0, type: 'NormalMap', texture: map

  preparePass: (context, mesh, model, pass, numPassesRendered = 0) ->
    {assigns} = mesh
    mesh.data.set assigns,
      vertices: 'VertexPosition'
      colors:   'VertexColor'
      normals:  'VertexNormal'
    assigns.ModelViewMatrix          = context.matrix_stack.getModelViewMatrix()
    assigns.ProjectionMatrix         = context.matrix_stack.getProjectionMatrix()
    assigns.NormalMatrix             = context.matrix_stack.getNormalMatrix()
    assigns.MaterialAmbientIntensity = @intensity.ambient
    assigns.MaterialAmbientColor     = @color.ambient
    assigns.WorldAmbientColor        = context.world.ambientColor
    assigns.MaterialDiffuseIntensity = @intensity.diffuse
    assigns.MaterialDiffuseColor     = @color.diffuse
    assigns.MaterialSpecularIntensity= @intensity.specular
    assigns.MaterialSpecularColor    = @color.specular
    assigns.MaterialShininess        = @shininess

    if light = context.world.lights[0]
      @eyeDir or= vec3.create()
      @eyePos or= vec3.create()
      assigns['LightConstantAttenuation']  = light.attenuation.constant
      assigns['LightLinearAttenuation']    = light.attenuation.linear
      assigns['LightQuadraticAttenuation'] = light.attenuation.quadratic
      assigns['LightAmbientColor']      = light.color.ambient
      assigns['LightSpecularColor']     = light.color.specular
      assigns['LightDiffuseColor']      = light.color.diffuse
      assigns['LightSpotInnerCos']      = light.innerSpotAngleCos
      assigns['LightSpotOuterCos']      = light.outerSpotAngleCos
      assigns['LightType']              = light.type
      assigns['EyeSpaceLightDirection'] = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
      assigns['EyeSpaceLightPosition']  = light.eyePosition  context.matrix_stack.getViewMatrix(),       @eyePos

    super context, mesh, model, pass, numPassesRendered
