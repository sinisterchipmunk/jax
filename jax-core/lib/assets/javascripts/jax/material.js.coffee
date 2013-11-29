#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    @[key] = value for key, value of options
    @shader = new Jax.Shader @name
    if @shaders
      if @shaders.common
        @vertex.append   @shaders.common
        @fragment.append @shaders.common
      if @shaders.vertex   then @vertex.append   @shaders.vertex
      if @shaders.fragment then @fragment.append @shaders.fragment
        
  @define 'vertex', get: -> @shader.vertex
  @define 'fragment', get: -> @shader.fragment

  ###
  Ensures its shader is up-to-date and valid for the specified context.
  ###
  validate: (context) ->
    @shader.validate context

  ###
  Renders a single mesh, taking as many passes as the material indicates
  is needed, and then returns the number of passes it actually took.
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
  