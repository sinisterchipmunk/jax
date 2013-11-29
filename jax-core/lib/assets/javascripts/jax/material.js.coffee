#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    @layers = []
    # options = jQuery.extend true, {}, options
    options = Jax.Util.merge options, {}
    for key, value of options
      switch key
        when 'layers'  then @addLayer layer for layer in value
        else @[key] = value
    if @shaders
      if @shaders.common
        @vertex.code   @shaders.common
        @fragment.code @shaders.common
      if @shaders.vertex   then @vertex.code   @shaders.vertex
      if @shaders.fragment then @fragment.code @shaders.fragment
        
  @define 'vertex', get: ->
    @prepareShader() unless @_shaderReady
    @shader.vertex

  @define 'fragment', get: ->
    @prepareShader() unless @_shaderReady
    @shader.fragment
  
  prepareShader: ->
    @shader = new Jax.Shader(@name)
    for layer, index in @layers
      @shader.addLayer layer
    @_shaderReady = true

  ###
  Ensures its shader is up-to-date and valid for the specified context.
  ###
  validate: (context) ->
    unless @_shaderReady
      @prepareShader()
      @shader.validate context
      @main? context
    @shader.validate context

  ###
  Renders a single mesh, taking as many passes as the material's layers indicate
  are needed, and then returns the number of passes it actually took.
  ###
  renderMesh: (context, mesh, model) ->
    @validate context
    numPassesRendered = 0
    numPassesRequested = @numPasses()
    mesh.data.context = context
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

  numPasses: -> 1
    
  preparePass: (context, mesh, model, pass, numPassesRendered = 0) ->
    assigns = mesh.assigns
    for layer, i in @layers
      if (result = layer.setup context, mesh, model, pass) is false
        return false
      for k, v of result
        assigns[k] = v

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
  