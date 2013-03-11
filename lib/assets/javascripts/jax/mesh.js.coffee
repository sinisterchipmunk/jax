#= require 'jax/core/coffee_patterns'
#= require 'jax/color'
#= require 'jax/core/event_emitter'
#= require 'jax/core/buffer'
#= require_self
#= require_tree './mesh'

class Mesh
  @include Jax.EventEmitter
  
  constructor: (options) ->
    @_valid = false
    @data = new Jax.Mesh.Data
    @_bounds = new Jax.Mesh.Bounds
    @_color = new Jax.Color
    @_initialized = false
    @draw_mode or= GL_POINTS
    if options
      @init = options.init if options.init
      @draw_mode = options.draw_mode if options.draw_mode
      @material = options.material || Jax.default_material
      @color = options.color if options.color
      
      delete options.init
      delete options.draw_mode
      delete options.material
      delete options.color
      for key, value of options
        @[key] = value
    else
      @material = Jax.default_material
  
  @define 'material'
    get: ->
      @validate() unless @_invalid
      @_material
    set: (material) ->
      return @_material = null unless material
      if material instanceof Jax.Material
        @_material = material
      else
        @_material = Jax.Material.find material
      @_material.name
      
  @define 'data'
    get: ->
      @validate() unless @_valid
      @_data
    set: (d) ->
      @invalidate()
      @_initialized = true # keep validation from rebuilding; user can still rebuild explicitly
      @_data.dispose() if @_data
      @_data = d
      @_data.addEventListener 'colorChanged', => @fireEvent 'colorChanged'
      @_data.addEventListener 'shouldRecalculateNormals', => @recalculateNormals()
      @_data.addEventListener 'shouldRecalculateTangents', => @recalculateTangents()
      @_data.addEventListener 'shouldRecalculateBitangents', => @recalculateBitangents()
      
  @define 'color'
    get: -> @_color
    set: (color) ->
      @_color = color
      @_data.color = @_color
      @fireEvent 'colorChanged'

  @define 'vertices'
    get: ->
      @validate() unless @_valid
      @data.vertices

  @define 'indices'
    get: ->
      @validate() unless @_valid
      @data.indexBuffer

  @define 'bounds'
    get: ->
      @validate() unless @_valid
      @_bounds
      
  @define 'submesh'
    get: ->
      @validate() unless @_valid
      @_submesh
    set: (submesh) ->
      @_submesh.dispose() if @_submesh
      @_submesh = submesh
      
  draw_mode: GL_POINTS
  
  ###
  Immediately recalculates this mesh's vertex normals.
  
  This method is meant to be overridden by subclasses. The default implementation just
  builds a vector from the calculated center of the mesh to each vertex and normalizes
  that vector.
  
  Note that if this mesh has more than 65535 vertices, its sub-mesh will not automatically
  have its normals recalculated, so you'll need to call `mesh.submesh.recalculateNormals()`.
  
  Returns true.
  ###
  recalcNormal = vec3.create()
  recalculateNormals: ->
    normals = @data.normalBuffer
    vertices = @data.vertexBuffer
    center = @bounds.center
    for i in [0...vertices.length] by 3
      recalcNormal[0] = vertices[i]
      recalcNormal[1] = vertices[i+1]
      recalcNormal[2] = vertices[i+2]
      vec3.subtract recalcNormal, recalcNormal, center
      vec3.normalize recalcNormal, recalcNormal
      normals[i  ] = recalcNormal[0]
      normals[i+1] = recalcNormal[1]
      normals[i+2] = recalcNormal[2]
    true
    
  recalculateTangents: ->
    throw new Error "Can't calculate tangents for #{this.__proto__.constructor.name}"
    
  recalculateBitangents: ->
    throw new Error "Can't calculate bitangents for #{this.__proto__.constructor.name}"
    
  render: (context, model, material) ->
    @validate() unless @_valid
    if material
      material = Jax.Material.find(material) unless material instanceof Jax.Material
    else material = @_material
    material.render context, this, model

  ###
  Returns true if this mesh is ready to be rendered, false otherwise. Note that the simple act of
  rendering it, in addition to a variety of other actions, will cause the mesh to automatically
  validate itself.
  ###
  isValid: -> @_valid
    
  ###
  Marks the mesh as "out of date", forcing it to refresh its vertex information based on the current
  state of its internal buffers the next time any of its data is used.
  
  If `forceRebuild` is true, the current mesh will be discarded and rebuilt (by invoking `#init`)
  the next time the mesh is validated. Otherwise, the current mesh will be reused.
  ###
  invalidate: (forceRebuild = false) ->
    @_initialized = false if forceRebuild
    @_valid = false
    
  ###
  If the mesh has been invalidated, this function will refresh its vertex information and relevant
  WebGL buffers.
  ###
  validate: ->
    return if @_valid
    throw new Error "Already validating -- look for recursion errors!" if @__validating
    @__validating = true
    @rebuild() unless @_initialized
    @_material or= Jax.Material.find "default"
    @recalculateBounds()
    @_data.indices_buf.dispose() if @_data.indices_buf
    @_data.indices_buf = new Jax.Buffer GL_ELEMENT_ARRAY_BUFFER, @_data.indexFormat, GL_STATIC_DRAW, @_data.indexBuffer, 1
    @__validating = false
    @_valid = true
    @fireEvent 'validated'
    this

  rebuild: ->
    return unless @init
    @dispose()
    return @validate() unless @__validating
    [vertices, colors, textures, normals, indices, tangents, bitangents] = [[], [], [], [], [], [], []]
    @init vertices, colors, textures, normals, indices, tangents, bitangents
    if vertices.length > 65535*3
      @submesh = @split vertices, colors, textures, normals, indices, tangents, bitangents
    @data = new Jax.Mesh.Data vertices, colors, textures, normals, indices, tangents, bitangents
    @_data.color = @_color
    @fireEvent 'rebuilt'
    @_initialized = true # keep validation from rebuilding; user can still rebuild explicitly
    this
  
  ###
  WebGL supports at most 65535 vertices in a single mesh. If the supplied arrays have more
  vertices than that, those vertices will be removed from the supplied arrays and passed into
  a brand-new instance of Jax.Mesh. The new mesh is returned, or `null` is returned if
  the given array has 65535 or fewer vertices.
  
  Note: the return value will be `null` if the `vertices` array has 65535 or fewer vertices,
  even if the other arrays contain more.
  
  Note: Subclasses of Jax.Mesh.Base are expected to override this method because the
  default implementation treats vertices as a point cloud, and may not produce accurate
  results if the draw mode is something other than GL_POINTS.
  ###
  split: (vertices, colors, textures, normals, indices, tangents, bitangents) ->
    max = 65535
    return null if vertices.length <= max * 3
    _v = _c = _t = _n = null
    _i = []
    _v = vertices.splice   max*3, vertices.length
    _c = colors.splice     max*4, colors.length     if colors.length     >= max*4
    _t = textures.splice   max*2, textures.length   if textures.length   >= max*2
    _n = normals.splice    max*3, normals.length    if normals.length    >= max*3
    _a = tangents.splice   max*4, tangents.length   if tangents.length   >= max*4
    _b = bitangents.splice max*3, bitangents.length if bitangents.length >= max*3
    for i in [0...indices.length]
      if indices[i] > max
        _i.push indices[i]
        indices.splice(i, 1)
        i--
        
    newMesh = new (this.__proto__.constructor)
      init: (v, c, t, n, i) ->
        (v.push __v for __v in _v)
        (c.push __c for __c in _c) if _c
        (t.push __t for __t in _t) if _t
        (n.push __n for __n in _n) if _n
        (n.push __a for __a in _a) if _a
        (n.push __b for __b in _b) if _b
        (i.push __i - 65535 for __i in _i)

  recalcPosition = vec3.create()
  recalculateBounds: ->
    [left, right, top, bottom, front, back] = [@_bounds.left, @_bounds.right, @_bounds.top,
                                               @_bounds.bottom, @_bounds.front, @_bounds.back]
    center = @_bounds.center
    length = @_data.vertexBuffer.length
    position = recalcPosition
    biggest = 0
    for i in [0...length] by 3
      position[0] = @_data.vertexBuffer[i]
      position[1] = @_data.vertexBuffer[i+1]
      position[2] = @_data.vertexBuffer[i+2]
      # index = i / 3
      # vertex = @data.vertices[index]
      # position = vertex.position
      if i == 0
        vec3.copy left,   position
        vec3.copy right,  position
        vec3.copy top,    position
        vec3.copy bottom, position
        vec3.copy front,  position
        vec3.copy back,   position
      else
        if position[0] < left[0]   then vec3.copy left,   position
        if position[0] > right[0]  then vec3.copy right,  position
        if position[1] < bottom[1] then vec3.copy bottom, position
        if position[1] > top[1]    then vec3.copy top,    position
        if position[2] < back[2]   then vec3.copy back,   position
        if position[2] > front[2]  then vec3.copy front,  position
    width  = right[0] - left[0]
    height = top[1]   - bottom[1]
    depth  = front[2] - back[2]
    biggest = (if width > height && width > depth then width else if height > depth then height else depth)
    center[0] = left[0]   + width  * 0.5
    center[1] = bottom[1] + height * 0.5
    center[2] = back[2]   + depth  * 0.5
    if width  < Math.EPSILON then width  = 0.0001
    if height < Math.EPSILON then height = 0.0001
    if depth  < Math.EPSILON then depth  = 0.0001
    [@_bounds.width, @_bounds.height, @_bounds.depth] = [width, height, depth]
    @_bounds.radius = biggest / 2
    @_bounds
    
  getIndexBuffer: -> @validate() unless @_valid; @data.indices_buf
  
  setColor: (c) ->
    if arguments.length > 1 then @color = arguments
    else @color = c
    
  dispose: ->
    @_data.dispose() if @_data
    @_submesh.dispose() if @_submesh
    @_initialized = false
    @invalidate()
    
class Mesh.Deprecated extends Mesh
  constructor: (args...) ->
    deprecation_message = "Using Jax.Mesh directly has been deprecated. Please use Jax.Mesh.Triangles or a similar variant instead."
    if typeof console isnt 'undefined'
      console.log new Error(deprecation_message).stack
    else throw new Error deprecation_message
    super args...
    
Jax.Mesh = Mesh.Deprecated
Jax.Mesh.Base = Mesh
