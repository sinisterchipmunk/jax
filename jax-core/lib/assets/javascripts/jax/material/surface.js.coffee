class Jax.Material.Surface extends Jax.Material.Custom
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
    get: -> @_color
    set: (obj) ->
      color = @_color
      isColor = typeof(obj) isnt 'object' or  \
                (obj.ambient is undefined and \
                 obj.diffuse is undefined and \
                 obj.specular is undefined)
      if isColor
        color.ambient  = color.diffuse  = color.specular = obj
      else
        color.ambient  = obj.ambient  if obj.ambient  isnt undefined
        color.diffuse  = obj.diffuse  if obj.diffuse  isnt undefined
        color.specular = obj.specular if obj.specular isnt undefined
        
  @define 'shininess',
    get: -> @_shininess
    set: (s) ->
      @findLayer(Jax.Material.Layer.PhongSpecular)?.shininess = s
      @_shininess = s

  @define 'pcf',
    get: -> @_pcf
    set: (s) ->
      @findLayer(Jax.Material.Layer.ShadowMap)?.pcf = s
      @_pcf = s

  constructor: (options, name) ->
    # FIXME These should probably become classes.
    @_intensity = {}
    mat = this
    Object.defineProperty @_intensity, 'ambient',
      get:     -> @_ambient
      set: (i) ->
        mat.findLayer(Jax.Material.Layer.WorldAmbient)?.intensity = i
        mat.findLayer(Jax.Material.Layer.LightAmbient)?.intensity = i
        @_ambient = i
    Object.defineProperty @_intensity, 'diffuse',
      get:     -> @_diffuse
      set: (i) ->
        mat.findLayer(Jax.Material.Layer.LambertDiffuse)?.intensity = i
        @_diffuse = i
    Object.defineProperty @_intensity, 'specular',
      get:     -> @_specular
      set: (i) ->
        mat.findLayer(Jax.Material.Layer.PhongSpecular)?.intensity = i
        @_specular = i

    @_color = {}
    mat = this
    Object.defineProperty @_color, 'ambient',
      get:     -> @_ambient
      set: (c) ->
        mat.findLayer(Jax.Material.Layer.WorldAmbient)?.color = Jax.Color.parse c
        mat.findLayer(Jax.Material.Layer.LightAmbient)?.color = Jax.Color.parse c
        @_ambient = c
    Object.defineProperty @_color, 'diffuse',
      get:     -> @_diffuse
      set: (c) ->
        mat.findLayer(Jax.Material.Layer.LambertDiffuse)?.color = Jax.Color.parse c
        @_diffuse = c
    Object.defineProperty @_color, 'specular',
      get:     -> @_specular
      set: (c) ->
        mat.findLayer(Jax.Material.Layer.PhongSpecular)?.color = Jax.Color.parse c
        @_specular = c

    @addLayer 'Position'
    @addLayer 'VertexColor'
    @addLayer 'WorldAmbient'
    @addLayer 'LambertDiffuse'
    @addLayer 'PhongSpecular'
    @addLayer 'ShadowMap'
    # Important: light ambient comes after shadow map so that ambient values
    # are not reduced by "shadows"!
    @addLayer 'LightAmbient'
    @addLayer 'Attenuation'
    @addLayer 'ClampColor'
        
    options or= {}
    options.intensity = 1      if options.intensity is undefined
    options.color     = '#fff' if options.color     is undefined
    options.shininess = 60     if options.shininess is undefined
    options.pcf       = true   if options.pcf       is undefined
    super options, name

    if options
      if options.textures
        for texture in options.textures
          @addLayer type: 'Texture', texture: texture
      if options.normalMaps
        for map in options.normalMaps
          # Normal maps must come before diffuse or specular shaders so that they
          # can perturb the normal before it's used to generate colors.
          @insertLayer 0, type: 'NormalMap', texture: map
