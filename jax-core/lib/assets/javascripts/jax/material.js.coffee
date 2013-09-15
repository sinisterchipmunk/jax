#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    # options = jQuery.extend true, {}, options
    options = Jax.Util.merge options, {}
    for key, value of options
      switch key
        when 'layers'  then @addLayer layer for layer in value
        else @[key] = value
        
  @define 'vertex', get: ->
    @prepareShader() unless @_shaderReady
    @shader.vertex

  @define 'fragment', get: ->
    @prepareShader() unless @_shaderReady
    @shader.fragment
  
  ###
  Returns the first layer that is an instance of the given class, or null
  if it is not found at all.
  ###
  findLayer: (klass) ->
    for layer in @layers
      if layer instanceof klass
        return layer
    null
  
  insertLayer: (index, options) ->
    @_shaderReady = false
    @layers or= []

    if typeof options is 'string' then options = { type: options }
    if options instanceof Jax.Material.Layer
      @_shaderReady = false
      @layers.splice index, 0, options
      return options
    
    options = Jax.Util.merge options, {}
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
    @_shaderReady = false
    @layers.splice index, 0, layer
    layer

  addLayer: (options) ->
    @layers or= []
    @insertLayer @layers.length, options
    
  prepareShader: ->
    @layers or= []
    crc = ""
    crc += ";" + layer.crc() for layer in @layers
    @shader = Jax.Shader.instances[crc] or= do =>
      shader = new Jax.Shader.Program(@name)
      for layer, index in @layers
        shader.addLayer layer
      shader
    @_shaderReady = true
  
  ###
  Renders a single mesh, taking as many passes as the material's layers indicate
  are needed, and then returns the number of passes it actually took.
  ###
  renderMesh: (context, mesh, model) ->
    @prepareShader() unless @_shaderReady
    numPassesRendered = 0
    numPassesRequested = 0
    mesh.data.context = context
    for layer in @layers
      layer.material = this
      layer.prepare context, mesh, model if layer.prepare
      passes = layer.numPasses context, mesh, model
      numPassesRequested = passes if passes > numPassesRequested

    mesh.data.context = context # in case it changed - FIXME make this not necessary
    @shader.bind context
    gl = context.renderer
    for pass in [0...numPassesRequested]
      continue unless @preparePass context, mesh, model, pass, numPassesRendered
      numPassesRendered++
      @drawBuffers context, mesh, pass
    if numPassesRendered > 1
      gl.blendFunc GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA
      gl.depthFunc GL_LESS
      
    numPassesRendered
    
  preparePass: (context, mesh, model, pass, numPassesRendered = 0) ->
    assigns = mesh.assigns
    variableMaps = @shader.variableMaps
    for layer, i in @layers
      if (result = layer.setup context, mesh, model, pass) is false
        return false
      else
        map = variableMaps[i]
        for k, v of result
          if map[k] then k = map[k]
          assigns[k] = v unless v is undefined
    if numPassesRendered is 1
      gl = context.renderer
      gl.blendFunc GL_ONE, GL_ONE
      gl.depthFunc GL_EQUAL
    @shader.set context, assigns
    return true
    
  drawBuffers: (context, mesh, pass = 0) ->
    if (buffer = mesh.getIndexBuffer()) && buffer.length
      buffer.bind context if pass is 0
      context.renderer.drawElements mesh.draw_mode, buffer.length, buffer.dataType, 0
    else if length = mesh.data.vertexBuffer?.length
      context.renderer.drawArrays mesh.draw_mode, 0, length
    
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
  