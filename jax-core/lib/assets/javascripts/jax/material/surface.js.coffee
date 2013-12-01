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
    for light, index in binding.context.world.lights
      do (light, index) =>
        binding.listen light, 'change:enabled', ->
          binding.set "LightEnabled[#{index}]", light.enabled
        binding.listen light.camera, 'change', @lightMatricesChanged
        binding.listen light, 'change:spot:innerAngle', ->
          binding.set "LightSpotInnerCos[#{index}]", light.innerSpotAngleCos
        binding.listen light, 'change:spot:outerAngle', ->
          binding.set "LightSpotOuterCos[#{index}]", light.outerSpotAngleCos
        binding.listen light, 'change:type', ->
          binding.set "LightType[#{index}]", light.type
        binding.listen light.attenuation, 'change:constant', ->
          binding.set "LightConstantAttenuation[#{index}]", light.attenuation.constant
        binding.listen light.attenuation, 'change:linear', ->
          binding.set "LightLinearAttenuation[#{index}]", light.attenuation.linear
        binding.listen light.attenuation, 'change:quadratic', ->
          binding.set "LightQuadraticAttenuation[#{index}]", light.attenuation.quadratic
        assigns = binding.get()
        assigns["LightAmbientColor[#{index}]"]         = light.color.ambient
        assigns["LightSpecularColor[#{index}]"]        = light.color.specular
        assigns["LightDiffuseColor[#{index}]"]         = light.color.diffuse
    this

  matricesChanged: (binding) =>
    {context, model, mesh} = binding
    assigns = binding.get()
    assigns.ModelViewMatrix          = context.matrix_stack.getModelViewMatrix()
    assigns.ProjectionMatrix         = context.matrix_stack.getProjectionMatrix()
    assigns.NormalMatrix             = context.matrix_stack.getNormalMatrix()

  lightMatricesChanged: (binding) =>
    {context} = binding
    for light, index in context.world.lights
      do (light, index) =>
        @eyeDir or= vec3.create()
        @eyePos or= vec3.create()
        light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
        light.eyePosition  context.matrix_stack.getViewMatrix(),       @eyePos
        binding.set "EyeSpaceLightDirection[#{index}]", @eyeDir
        binding.set "EyeSpaceLightPosition[#{index}]",  @eyePos
    this
