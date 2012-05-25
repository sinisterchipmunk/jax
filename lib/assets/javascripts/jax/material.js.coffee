#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    @shader = new Jax.Shader.Program @name
    @layers = []
    @assigns = {}
    options = Jax.Util.normalizeOptions options, {}
    for key, value of options
      switch key
        when 'layers'  then @addLayer layer for layer in value
        when 'color'   then @[key] = Jax.Color.parse value
        else @[key] = value
    
  @define 'vertex', get: -> @shader.vertex
  @define 'fragment', get: -> @shader.fragment
  
  addLayer: (options) ->
    if options instanceof Jax.Material.Layer
      @layers.push options
      return options
    
    Klass = Jax.Material[options.type]
    throw new Error "#{@name}: Material layer type #{options.type} could not be found" unless Klass
    options = Jax.Util.normalizeOptions options, shader: Klass.shader || Jax.Util.underscore options.type
    layer = new Klass options, this
    if layer instanceof Jax.Material
      throw new Error """
        #{@name}: Custom material layers now inherit from Jax.Material.Layer instead of Jax.Material.
        Please also note that the constructor takes two arguments: the classic `options` hash, and a
        reference to the layer's parent instance of `Jax.Material`, which should be passed to `super`.
        Please see the documentation for more information.
      """
    @layers.push layer
    layer
  
  ###
  Renders the mesh using all material layers, beginning at `layerIndex`,
  ensuring that they each get the number of passes they require.
  
  The number of passes actually performed is a product of the required
  passes of all layers. For instance, a material with 3 layers, requiring
  1, 2 and 3 passes respectively, will result in 1 * 2 * 3 = 6 passes.
  The `passes` argument in each layer's `setVariables` method is generated
  here like so:
  
    | Material | Pass 1 | Pass 2 | Pass 3 | Pass 4 | Pass 5 | Pass 6 |
    |  1       |    0   |    0   |    0   |   0    |   0    |    0   |
    |  2       |    0   |    0   |    0   |   1    |   1    |    1   |
    |  3       |    0   |    1   |    2   |   0    |   1    |    2   |
  
  Thus, no matter how many rendering passes are actually performed, a layer
  is guaranteed of two things:
  
    1. The value of the `pass` variable will never exceed the number of
       passes the layer requires.
    2. The set of layers will be rendered in every unique combination
       possible.
  
  Redundant calls to `setVariables` are optimized away, so a layer should
  not count on them or base its internal state upon them.
  
  Does **NOT** assume the material shader has been bound.
  
  Note: in most cases, you want to use `render` instead of `renderPasses`.
  ###
  renderPasses: (context, mesh, model, layerIndex = 0) ->
    layer = @layers[layerIndex]
    throw new Error "layerIndex #{layerIndex} out of range" unless layer
    numLayers = @layers.length
    for pass in [0...layer.numPasses context]
      layer.setup context, mesh, model, pass
      if layerIndex+1 == numLayers
        # all layers are set up, now render this pass
        @shader.set context, @assigns
        @drawBuffers context, mesh
      else
        @renderPasses context, mesh, model, layerIndex+1
    
  drawBuffers: (context, mesh) ->
    if (buffer = mesh.getIndexBuffer()) && buffer.length
      buffer.bind context
      context.gl.drawElements mesh.draw_mode, buffer.length, buffer.dataType, 0
    else if (buffer = mesh.getVertexBuffer()) && buffer.length
      context.gl.drawArrays mesh.draw_mode, 0, buffer.length
    
  render: (context, mesh, model) ->
    @shader.bind context
    @renderPasses context, mesh, model
  
  @instances: {}
  @resources: {}
  
  @find: (name) ->
    return Jax.Material.instances[name] if Jax.Material.instances[name]
    throw new Error "Material '#{name}' could not be found!" unless data = Jax.Material.resources[name]
    # FIXME Messy...
    switch data.type?.toString().toUpperCase()
      when undefined
        # Legacy. Equivalent to Custom, but with a basic shader.
        Klass = Jax.Material
        data.layers or= []
        data.layers.unshift type: "Basic"
      when 'CUSTOM' then Klass = Jax.Material
      when 'SURFACE', 'VOLUME', 'HALO', 'WIRE'
        throw new Error "#{name}: Material type #{data.type} is not yet implemented."
      else
        throw new Error "#{name}: Material property `type` is invalid. Please note that its meaning changed in Jax v2.1 and see documentation for details."
    Jax.Material.instances[name] = new Klass data, name
    
  @addResources: (resources) ->
    for name, data of resources
      # throw new Error "Duplicate material name: #{name}" if Jax.Material.resources[name]
      Jax.Material.resources[name] = data

  @clearResources: ->
    Jax.Material.resources = {}
    Jax.Material.instances = {}
  