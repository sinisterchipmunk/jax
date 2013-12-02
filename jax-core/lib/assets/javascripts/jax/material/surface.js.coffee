class Jax.Material.Surface extends Jax.Material.Custom
  # the number of lights the shader can handle in a single pass
  Surface.MAX_LIGHTS_PER_PASS = 8

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

    # if options
    #   if options.textures
    #     for texture in options.textures
    #       @addLayer type: 'Texture', texture: texture
    #   if options.normalMaps
    #     for map in options.normalMaps
    #       # Normal maps must come before diffuse or specular shaders so that
    #       # they can perturb the normal before it's used to generate colors.
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
    binding.listen context.world, 'lightAdded', @lightAdded
    binding.on 'prepare', @prepareLightingPass

  ###
  1 pass is required for every `Surface.MAX_LIGHTS_PER_PASS` lights.
  ###
  numPasses: (binding) ->
    count = binding.context.world.lights.length
    Math.ceil count / Surface.MAX_LIGHTS_PER_PASS

  ###
  We must assign the computed light uniforms to real variable names, allowing
  for multiple passes if the number of lights in the scene exceeds the number
  of lights supported by the shader. This is a lightweight operation that
  simply assigns all relevant values by reference. It runs on every pass.
  ###
  prepareLightingPass: (event) =>
    {binding, pass} = event
    assigns = binding.get()
    # only do world ambient lighting on first pass
    if pass is 0 then assigns["WorldAmbientEnabled"] = true
    else assigns["WorldAmbientEnabled"] = false

    start = pass * Surface.MAX_LIGHTS_PER_PASS
    for index in [start...(start + Surface.MAX_LIGHTS_PER_PASS)]
      unless light = binding.context.world.lights[index]
        assigns["LightEnabled[#{index}]"] = false
        return
      ns = "light.#{light.id}"
      assigns["LightEnabled[#{index}]"]              = assigns["#{ns}.enabled"]
      assigns["EyeSpaceLightDirection[#{index}]"]    = assigns["#{ns}.eyeSpaceDirection"]
      assigns["EyeSpaceLightPosition[#{index}]"]     = assigns["#{ns}.eyeSpacePosition"]
      assigns["LightType[#{index}]"]                 = assigns["#{ns}.type"]
      assigns["LightAmbientColor[#{index}]"]         = assigns["#{ns}.color.ambient"]
      assigns["LightDiffuseColor[#{index}]"]         = assigns["#{ns}.color.diffuse"]
      assigns["LightSpecularColor[#{index}]"]        = assigns["#{ns}.color.specular"]
      assigns["LightSpotInnerCos[#{index}]"]         = assigns["#{ns}.cos.inner"]
      assigns["LightSpotOuterCos[#{index}]"]         = assigns["#{ns}.cos.outer"]
      assigns["LightConstantAttenuation[#{index}]"]  = assigns["#{ns}.atten.constant"]
      assigns["LightLinearAttenuation[#{index}]"]    = assigns["#{ns}.atten.linear"]
      assigns["LightQuadraticAttenuation[#{index}]"] = assigns["#{ns}.atten.quadratic"]
    this

  lightAdded: (binding) =>
    # we can pretty much store anything we want in the bindings without any
    # performance penalty. Only fields that actually are used in the shaders
    # will be iterated over and assigned to the GPU.
    assigns = binding.get()
    for light in binding.context.world.lights
      ns = "light.#{light.id}"
      continue if assigns["#{ns}.registered"]
      do (light, ns) =>
        assigns["#{ns}.registered"] = true
        binding.listen light.camera, 'change', =>
          @lightMatricesChanged binding, light
        binding.listen light, 'change:enabled', ->
          binding.set "#{ns}.enabled", light.enabled
        binding.listen light, 'change:spot:innerAngle', ->
          binding.set "#{ns}.cos.inner", light.innerSpotAngleCos
        binding.listen light, 'change:spot:outerAngle', ->
          binding.set "#{ns}.cos.outer", light.outerSpotAngleCos
        binding.listen light, 'change:type', ->
          binding.set "#{ns}.type", light.type
        binding.listen light.attenuation, 'change:constant', ->
          binding.set "#{ns}.atten.constant", light.attenuation.constant
        binding.listen light.attenuation, 'change:linear', ->
          binding.set "#{ns}.atten.linear", light.attenuation.linear
        binding.listen light.attenuation, 'change:quadratic', ->
          binding.set "#{ns}.atten.quadratic", light.attenuation.quadratic
        assigns["#{ns}.color.ambient"]  = light.color.ambient
        assigns["#{ns}.color.specular"] = light.color.specular
        assigns["#{ns}.color.diffuse"]  = light.color.diffuse
    this

  lightMatricesChanged: (binding, light) =>
    {context} = binding
    @eyeDir or= vec3.create()
    @eyePos or= vec3.create()
    light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    light.eyePosition  context.matrix_stack.getViewMatrix(),       @eyePos
    binding.set "light.#{light.id}.eyeSpaceDirection", @eyeDir
    binding.set "light.#{light.id}.eyeSpacePosition",  @eyePos
    this

  matricesChanged: (binding) =>
    {context, model, mesh} = binding
    binding.set 'ModelViewMatrix',  context.matrix_stack.getModelViewMatrix()
    binding.set 'ProjectionMatrix', context.matrix_stack.getProjectionMatrix()
    binding.set 'NormalMatrix',     context.matrix_stack.getNormalMatrix()
