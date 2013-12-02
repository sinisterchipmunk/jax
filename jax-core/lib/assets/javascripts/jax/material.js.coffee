#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    @[key] = value for key, value of options
    @shader = new Jax.Shader @name
    @_bindings = {}
    if @shaders
      if @shaders.common
        @vertex.append   @shaders.common
        @fragment.append @shaders.common
      if @shaders.vertex   then @vertex.append   @shaders.vertex
      if @shaders.fragment then @fragment.append @shaders.fragment
        
  @define 'vertex', get: -> @shader.vertex
  @define 'fragment', get: -> @shader.fragment

  ###
  Renders a single mesh, taking as many passes as the material indicates
  is needed, and then returns the number of passes it actually took.
  ###
  renderMesh: (binding) ->
    numPassesRendered = 0
    {context} = binding
    @shader.bind context
    gl = context.renderer
    binding.bindMesh()
    for pass in [0...@numPasses(binding)]
      continue unless @preparePass binding, pass, numPassesRendered
      numPassesRendered++
      @drawBuffers binding, pass
    if numPassesRendered > 1
      gl.blendFunc GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA
      gl.depthFunc GL_LESS
    numPassesRendered

  numPasses: -> 1
    
  preparePass: (binding, pass, numPassesRendered = 0) ->
    binding.prepare pass
    context = binding.context
    if numPassesRendered is 1
      gl = context.renderer
      gl.blendFunc GL_ONE, GL_ONE
      gl.depthFunc GL_EQUAL
    @shader.set context, binding.get()
    return true
    
  drawBuffers: (binding, pass = 0) ->
    {context, mesh} = binding
    if (buffer = mesh.getIndexBuffer()) && buffer.length
      buffer.bind context if pass is 0
      context.renderer.drawElements mesh.draw_mode, buffer.length, buffer.dataType, 0
    else if length = mesh.data.vertexBuffer?.length
      context.renderer.drawArrays mesh.draw_mode, 0, length
    
  ###
  Renders the given mesh and its sub-mesh, if any, and then returns
  the total number of render passes that were required.
  ###
  render: (context, model, mesh) ->
    numPassesRendered = 0
    while mesh
      guid = Jax.Material.Binding.guid context, model, mesh
      unless binding = @_bindings[guid]
        binding = @_bindings[guid] = @createBinding context, model, mesh
      numPassesRendered += @renderMesh binding
      mesh = mesh.submesh
    numPassesRendered

  createBinding: (context, model, mesh) ->
    binding = new Jax.Material.Binding context, model, mesh
    @registerBinding binding
    binding

  ###
  Subclasses should override this method and begin listening for and reacting
  to events.
  ###
  registerBinding: (binding) ->
  
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
      when 'SURFACE' then Klass = Jax.Material.Surface
      when 'HALO'    then Klass = Jax.Material.Halo
      when 'WIRE'    then Klass = Jax.Material.Wire
      else
        throw new Error "Material type '#{data.type}' is invalid. It must " +
                        "be one of 'Custom', 'Surface', 'Halo', or 'Wire'."
    throw new Error "#{name}: Material type #{data.type} is not yet implemented." unless Klass
    Jax.Material.instances[name] = new Klass data, name
    
  @addResources: (resources) ->
    for name, data of resources
      # throw new Error "Duplicate material name: #{name}" if Jax.Material.resources[name]
      Jax.Material.resources[name] = data

  @clearResources: ->
    Jax.Material.resources = {}
    Jax.Material.instances = {}
  