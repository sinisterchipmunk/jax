#= require 'jax/core/coffee_patterns'
#= require 'jax/color'
#= require "jax/webgl/core/events"
#= require 'jax/webgl/core/buffer'
#= require_self
#= require_tree './mesh'

class Mesh
  @include Jax.Events.Methods
  
  constructor: (options) ->
    @_valid = false
    @_data = new Jax.Mesh.Data
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
      @_data = d
      @_data.addEventListener 'colorChanged', => @fireEvent 'colorChanged'
      
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
  ###
  invalidate: ->
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
    this

  rebuild: ->
    return unless @init
    @dispose()
    return @validate() unless @__validating
    [vertices, colors, textures, normals, indices] = [[], [], [], [], []]
    @init vertices, colors, textures, normals, indices
    @submesh = @split vertices, colors, textures, normals, indices if vertices.length > 65535*3
    @_data = new Jax.Mesh.Data vertices, colors, textures, normals, indices
    @_data.color = @_color
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
  split: (vertices, colors, textures, normals, indices) ->
    max = 65535
    return null if vertices.length <= max * 3
    _v = _c = _t = _n = null
    _i = []
    _v = vertices.splice max*3, vertices.length
    _c = colors.splice   max*4, colors.length   if colors.length   >= max*4
    _t = textures.splice max*2, textures.length if textures.length >= max*2
    _n = normals.splice  max*3, normals.length  if normals.length  >= max*3
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
        (i.push __i - 65535 for __i in _i)

  recalcPosition = vec3.create()
  recalculateBounds: ->
    [left, right, top, bottom, front, back] = [@_bounds.left, @_bounds.right, @_bounds.top,
                                               @_bounds.bottom, @_bounds.front, @_bounds.back]
    center = @_bounds.center
    length = @_data.vertexBuffer.length
    position = recalcPosition
    for i in [0...length] by 3
      position[0] = @_data.vertexBuffer[i]
      position[1] = @_data.vertexBuffer[i+1]
      position[2] = @_data.vertexBuffer[i+2]
      # index = i / 3
      # vertex = @data.vertices[index]
      # position = vertex.position
      if i == 0
        vec3.set position, left
        vec3.set position, right
        vec3.set position, top
        vec3.set position, bottom
        vec3.set position, front
        vec3.set position, back
      else
        if position[0] < left[0]   then vec3.set position, left
        if position[0] > right[0]  then vec3.set position, right
        if position[1] < bottom[1] then vec3.set position, bottom
        if position[1] > top[1]    then vec3.set position, top
        if position[2] < back[2]   then vec3.set position, back
        if position[2] > front[2]  then vec3.set position, front
    width  = right[0] - left[0]
    height = top[1]   - bottom[1]
    depth  = front[2] - back[2]
    center[0] = left[0]   + width  * 0.5
    center[1] = bottom[1] + height * 0.5
    center[2] = back[2]   + depth  * 0.5
    if width  < Math.EPSILON then width  = 0.0001
    if height < Math.EPSILON then height = 0.0001
    if depth  < Math.EPSILON then depth  = 0.0001
    [@_bounds.width, @_bounds.height, @_bounds.depth] = [width, height, depth]
    @_bounds
    
  getIndexBuffer: -> @validate() unless @_valid; @data.indices_buf
  
  getTangentBuffer: ->
    @validate() unless @_valid
    @rebuildTangentBuffer() unless @tangent_buffer
    @tangent_buffer
    
  rebuildTangentBuffer: -> Jax.Mesh::_makeTangentBuffer.call this
    
  setColor: (c) ->
    if arguments.length > 1 then @color = arguments
    else @color = c
    
  dispose: ->
    @_data.dispose() if @_data
    @_submesh.dispose() if @_submesh
    @invalidate()
    
class Mesh.Deprecated extends Mesh
  constructor: (args...) ->
    deprecation_message = "Using Jax.Mesh directly has been deprecated. Please use Jax.Mesh.Triangles or a similar variant instead."
    if typeof console isnt 'undefined'
      console.log deprecation_message
    else throw new Error deprecation_message
    super args...
    
Jax.Mesh = Mesh.Deprecated
Jax.Mesh.Base = Mesh
