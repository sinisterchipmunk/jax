#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    # @shader = new Jax.Shader.Program @name
    @_localizedShader = false
    @layers = []
    if @__proto__.constructor.__shader
      @shader = @__proto__.constructor.__shader
      for layer in @__proto__.constructor.getLayers()
        @layers.push new (layer.__proto__.constructor)(layer)
    else
      @shader = @__proto__.constructor.__shader = new Jax.Shader.Program @name
      layers = []
      _layers = @__proto__.constructor.getLayers()
      for layer in _layers
        layers.push @addLayer layer, false
      _layers.splice 0, _layers.length, layers...
      
    @assigns = {}
    options = Jax.Util.normalizeOptions options, {}
    for key, value of options
      switch key
        when 'layers'  then @addLayer layer for layer in value
        else @[key] = value
        
  # @__layers: {}
  @__shader: null # these will be instantiated dynamically in order not to taint subclasses
  
  @getLayers: ->
    parent = @__super__
    if @__layers
      # make sure it's not inherited
      if parent
        return @__layers unless @__layers is parent.constructor.getLayers()
      else return @__layers
    array = []
    if parent
      parentLayers = parent.constructor.getLayers()
      array.push layer for layer in parentLayers
    @__layers = array
    array
  @addLayer: (options) -> @getLayers().push options

  @define 'vertex', get: -> @shader.vertex
  @define 'fragment', get: -> @shader.fragment
  
  ###
  Returns the first layer that is an instance of the given class, or null
  if it is not found at all.
  ###
  findLayer: (klass) ->
    for layer in @layers
      if layer instanceof klass
        return layer
    null
  
  
  ###
  Causes this material instance to split its shader apart from the shared
  shader which is used by default for all instances of a given material.
  This is slower, but allows for greater customization of a material.
  
  For example, a material which normally has diffuse lighting but no
  specular lighting can localize its shader so that a specific instance
  of the material can have specular lighting added to it without tainting
  the shader of any other instance.
  ###
  localizeShader: ->
    return if @_localizedShader
    @_localizedShader = true
    @shader = new Jax.Shader.Program @shader.name+"-localized-"+Jax.guid()
    [layers, @layers] = [@layers, []]
    for layer in layers
      @addLayer layer
    true
    
  insertLayer: (index, options, localize = true) ->
    @localizeShader() if localize
    if typeof options is 'string' then options = { type: options }
    if options instanceof Jax.Material.Layer
      options.attachTo this, index
      @layers.splice index, 0, options
      return options
    
    options = Jax.Util.normalizeOptions options, {}
    Klass = Jax.Material.Layer[options.type]
    unless Klass
      if Jax.Material[options.type]
        console.log "#{@name}: Material layer type #{options.type} could not be found "+ \
                    "within namespace Jax.Material.Layer, but an object of the same name "+ \
                    "was found within namespace Jax.Material. Please note that this is " + \
                    "deprecated usage, and material layers should appear within namespace "+ \
                    "Jax.Material.Layer."
        Klass = Jax.Material[options.type]
      else
        throw new Error "#{@name}: Material layer type #{options.type} could not be found"
    options.shader or= Klass.shader || Jax.Util.underscore options.type
    layer = new Klass options
    if layer instanceof Jax.Material
      throw new Error """
        #{@name}: Custom material layers now inherit from Jax.Material.Layer instead of Jax.Material.
      """
    layer.attachTo this, index
    @layers.splice index, 0, layer
    layer
  
  addLayer: (options, localize = true) ->
    @insertLayer @layers.length, options, localize
    
  clearAssigns: ->
    assigns = @assigns
    for k of assigns
      assigns[k] = undefined
    true
  
  ###
  Renders a single mesh, taking as many passes as the material's layers indicate
  are needed, and then returns the number of passes it actually took.
  ###
  renderMesh: (context, mesh, model) ->
    numPassesRendered = 0
    numPassesRequested = 0
    mesh.data.context = context
    for layer in @layers
      layer.material = this
      layer.prepare context, mesh, model if layer.prepare
      passes = layer.numPasses context, mesh, model
      numPassesRequested = passes if passes > numPassesRequested

    @clearAssigns() # don't taint assigns from one mesh to the next
    mesh.data.context = context # in case it changed - FIXME make this not necessary
    @shader.bind context
    gl = context.gl
    for pass in [0...numPassesRequested]
      continue unless @preparePass context, mesh, model, pass, numPassesRendered
      numPassesRendered++
      @drawBuffers context, mesh, pass
    if numPassesRendered > 1
      gl.blendFunc GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA
      gl.depthFunc GL_LESS
      
    numPassesRendered
    
  preparePass: (context, mesh, model, pass, numPassesRendered = 0) ->
    for layer in @layers
      if (result = layer.setup context, mesh, model, pass) is false
        return false
      else
        map = layer.variableMap
        for k, v of result
          if map[k] then k = map[k]
          @assigns[k] = v unless v is undefined
    if numPassesRendered is 1
      gl = context.gl
      gl.blendFunc GL_ONE, GL_ONE
      gl.depthFunc GL_EQUAL
    @shader.set context, @assigns
    return true
    
  drawBuffers: (context, mesh, pass = 0) ->
    if (buffer = mesh.getIndexBuffer()) && buffer.length
      buffer.bind context if pass is 0
      context.gl.drawElements mesh.draw_mode, buffer.length, buffer.dataType, 0
    else if length = mesh.data.vertexBuffer?.length
      context.gl.drawArrays mesh.draw_mode, 0, length
    
  ###
  Renders the given mesh and its sub-mesh, if any, and then returns
  the total number of render passes that were required.
  ###
  render: (context, mesh, model) ->
    numPassesRendered = 0
    while mesh
      numPassesRendered += @renderMesh context, mesh, model
      mesh = mesh.submesh
    numPassesRendered
  
  @instances: {}
  @resources: {}
  @__isMaterial: true

  @all: -> name for name of Jax.Material.resources
  
  @find: (name) ->
    return Jax.Material.instances[name] if Jax.Material.instances[name]
    throw new Error "Material '#{name}' could not be found!" unless data = Jax.Material.resources[name]
    # FIXME Messy...
    switch data.type?.toString().toUpperCase()
      when 'CUSTOM'  then Klass = Jax.Material.Custom
      when 'LEGACY'  then Klass = Jax.Material.Legacy
      when 'SURFACE' then Klass = Jax.Material.Surface
      when 'HALO'    then Klass = Jax.Material.Halo
      when 'WIRE'    then Klass = Jax.Material.Wire
      else
        # last-ditch effort to find custom materials
        unless (Klass = Jax.Material[data.type]) and Klass.__isMaterial
          console.log "#{name}: Material type #{data.type} is invalid. Please note that its meaning "+ \
                      "changed in Jax v3.0; it should be one of 'Surface', 'Legacy', 'Wire', 'Custom'."
          console.log "Type of material #{name} is defaulting to 'Legacy'."
          Klass = Jax.Material.Legacy
    throw new Error "#{name}: Material type #{data.type} is not yet implemented." unless Klass
    Jax.Material.instances[name] = new Klass data, name
    
  @addResources: (resources) ->
    for name, data of resources
      # throw new Error "Duplicate material name: #{name}" if Jax.Material.resources[name]
      Jax.Material.resources[name] = data

  @clearResources: ->
    Jax.Material.resources = {}
    Jax.Material.instances = {}
  