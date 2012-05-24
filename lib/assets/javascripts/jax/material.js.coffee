#= require_self
#= require_tree "./material"

class Jax.Material
  constructor: (options, @name = "generic") ->
    @shader = new Jax.Shader2.Program @name
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
    
  render: (context, mesh, model) ->
    @shader.bind context
    for layer in @layers
      layer.setup context, mesh, model
    @shader.set context, @assigns
    
    if (buffer = mesh.getIndexBuffer()) && buffer.length
      buffer.bind context
      context.gl.drawElements mesh.draw_mode, buffer.length, buffer.dataType, 0
    else if (buffer = mesh.getVertexBuffer()) && buffer.length
      context.gl.drawArrays mesh.draw_mode, 0, buffer.length
  
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
  