#= require jax/mixins/event_emitter

class Jax.Material.Surface extends Jax.Material.Custom
  @include Jax.Mixins.EventEmitter

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
      @trigger 'change:shininess'

  @define 'pcf',
    get: -> @_pcf
    set: (s) ->
      @_pcf = s
      @trigger 'change:pcf'

  constructor: (options, name) ->
    @_color = new Jax.Color.Group 'diffuse', 'ambient', 'specular'

    # FIXME These should probably become classes.
    @_intensity = {}
    mat = this
    Object.defineProperty @_intensity, 'ambient',
      get:     -> @_ambient
      set: (i) =>
        @_intensity._ambient = i
        @trigger 'change:intensity:ambient'
    Object.defineProperty @_intensity, 'diffuse',
      get:     -> @_diffuse
      set: (i) =>
        @_intensity._diffuse = i
        @trigger 'change:intensity:diffuse'
    Object.defineProperty @_intensity, 'specular',
      get:     -> @_specular
      set: (i) =>
        @_intensity._specular = i
        @trigger 'change:intensity:specular'

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

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.set 'WorldAmbientColor', context.world.ambientColor
    binding.set 'MaterialAmbientColor', @color.ambient
    binding.set 'MaterialDiffuseColor', @color.diffuse
    binding.set 'MaterialSpecularColor', @color.specular
    binding.set 'WorldAmbientColor', context.world.ambientColor
    binding.set 'MaterialDiffuseColor', @color.diffuse
    binding.set 'MaterialSpecularColor', @color.specular
    binding.listen mesh.data, 'change', ->
      mesh.data.set binding,
        vertices: 'VertexPosition'
        colors:   'VertexColor'
        normals:  'VertexNormal'
    binding.listen model.camera, 'change', @matricesChanged
    binding.listen context.world.cameras[0], 'change', @matricesChanged
    binding.listen this, 'change:intensity:ambient', =>
      binding.set 'MaterialAmbientIntensity', @intensity.ambient
    binding.listen this, 'change:intensity:diffuse', =>
      binding.set 'MaterialDiffuseIntensity', @intensity.diffuse
    binding.listen this, 'change:intensity:specular', =>
      binding.set 'MaterialSpecularIntensity', @intensity.specular
    binding.listen this, 'change:shininess', =>
      binding.set 'MaterialShininess', @shininess
    binding.listen context.world, 'lightAdded lightRemoved', @allLightsChanged

  allLightsChanged: (binding) =>
    # TODO: handle more than 1 light :)
    if light = binding.context.world.lights[0]
      binding.listen light.camera, 'change', @lightMatricesChanged
      binding.listen light, 'change:spot:innerAngle', ->
        binding.set 'LightSpotInnerCos', light.innerSpotAngleCos
      binding.listen light, 'change:spot:outerAngle', ->
        binding.set 'LightSpotOuterCos', light.outerSpotAngleCos
      binding.listen light, 'change:type', ->
        binding.set 'LightType', light.type
      binding.listen light.attenuation, 'change:constant', ->
        binding.set 'LightConstantAttenuation', light.attenuation.constant
      binding.listen light.attenuation, 'change:linear', ->
        binding.set 'LightLinearAttenuation', light.attenuation.linear
      binding.listen light.attenuation, 'change:quadratic', ->
        binding.set 'LightQuadraticAttenuation', light.attenuation.quadratic
      assigns = binding.get()
      assigns['LightAmbientColor']         = light.color.ambient
      assigns['LightSpecularColor']        = light.color.specular
      assigns['LightDiffuseColor']         = light.color.diffuse

  matricesChanged: (binding) =>
    {context, model, mesh} = binding
    assigns = binding.get()
    assigns.ModelViewMatrix          = context.matrix_stack.getModelViewMatrix()
    assigns.ProjectionMatrix         = context.matrix_stack.getProjectionMatrix()
    assigns.NormalMatrix             = context.matrix_stack.getNormalMatrix()

  lightMatricesChanged: (binding) =>
    {context} = binding
    if light = context.world.lights[0]
      @eyeDir or= vec3.create()
      @eyePos or= vec3.create()
      light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
      light.eyePosition  context.matrix_stack.getViewMatrix(),       @eyePos
      binding.set 'EyeSpaceLightDirection', @eyeDir
      binding.set 'EyeSpaceLightPosition',  @eyePos
