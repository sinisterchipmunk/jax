#= require 'jax/core/coffee_patterns'
#= require 'jax/webgl/core/chunked_array'
#= require 'jax/color'
#= require "jax/webgl/core/events"
#= require 'jax/webgl/core/buffer'
#= require_self
#= require 'jax/webgl/mesh/bounds'
#= require 'jax/webgl/mesh/vertex_buffers'
#= require 'jax/webgl/mesh/tangent_space'

class Mesh
  constructor: (options) ->
    @_valid = false
    @_vertex_buffers = new Jax.Mesh.VertexBuffers
    @_bounds = new Jax.Mesh.Bounds
    @_vertices = []
    @_color = new Jax.Color
    @_initialized = false
    @draw_mode or= GL_POINTS
    if options
      @init = options.init if options.init
      @draw_mode = options.draw_mode if options.draw_mode
      @material = options.material || Jax.default_material
    else
      @material = Jax.default_material
  
  @define 'material'
    get: ->
      @validate() unless @_invalid
      @_material.name
    set: (material) ->
      return @_material = null unless material
      if material instanceof Jax.Material
        @_material = material
      else
        @_material = Jax.Material.find material
      @_material.name
      
  @define 'color'
    get: -> @_color
    set: (color) ->
      @invalidate()
      @_color = Jax.Color.parse(color)
      @fireEvent 'color_changed'

  @define 'vertices'
    get: ->
      @validate() unless @_valid
      @_vertices

  @define 'indices'
    get: ->
      @validate() unless @_valid
      @_vertex_buffers.indices.raw
    set: (indices_array) ->
      @invalidate()
      ary = @_vertex_buffers.indices.array indices_array.length
      for i in [0...indices_array.length]
        ary[i] = indices_array[i]
      ary

  @define 'bounds'
    get: ->
      @validate() unless @_valid
      @_bounds
      
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
    @rebuild() unless @_initialized
    @_material or= Jax.Material.find "default"
    mesh_color = @_color.toVec4()
    vertices = @_vertex_buffers.vertices.subdivide 3
    normals  = @_vertex_buffers.normals.subdivide  3
    colors   = @_vertex_buffers.colors.subdivide   4
    textures = @_vertex_buffers.textures.subdivide 2
    blended_colors = @_vertex_buffers.blended_colors.subdivide 4
    index = 0
    for i in [0...vertices.length]
      vertex = vertices[i]
      if i == 0
        vec3.set vertex, @_bounds.left
        vec3.set vertex, @_bounds.right
        vec3.set vertex, @_bounds.top
        vec3.set vertex, @_bounds.bottom
        vec3.set vertex, @_bounds.front
        vec3.set vertex, @_bounds.back
      else
        if vertex[0] < @_bounds.left[0]   then vec3.set vertex, @_bounds.left
        if vertex[0] > @_bounds.right[0]  then vec3.set vertex, @_bounds.right
        if vertex[1] < @_bounds.bottom[1] then vec3.set vertex, @_bounds.bottom
        if vertex[1] > @_bounds.top[1]    then vec3.set vertex, @_bounds.top
        if vertex[2] < @_bounds.back[2]   then vec3.set vertex, @_bounds.back
        if vertex[2] > @_bounds.front[2]  then vec3.set vertex, @_bounds.front
      vertex = @_vertices[i]
      vertex.position = vertices[i]
      vertex.normal   = normals[i]
      vertex.color    = colors[i]
      vertex.texture  = textures[i]
      vertex.blended_color = vec4.multiply colors[i], mesh_color, blended_colors[i]
    @_bounds.width  = @_bounds.right[0] - @_bounds.left[0]
    @_bounds.height = @_bounds.top[1]   - @_bounds.bottom[1]
    @_bounds.depth  = @_bounds.front[2] - @_bounds.back[2]
    @_bounds.center[0] = @_bounds.left[0]   + @_bounds.width  / 2
    @_bounds.center[1] = @_bounds.bottom[1] + @_bounds.height / 2
    @_bounds.center[2] = @_bounds.back[2]   + @_bounds.depth  / 2
    if @_bounds.width  < Math.EPSILON then @_bounds.width  = 0.0001
    if @_bounds.height < Math.EPSILON then @_bounds.height = 0.0001
    if @_bounds.depth  < Math.EPSILON then @_bounds.depth  = 0.0001
    @_vertex_buffers.rehash()
    @_vertex_buffers.colors.buf   = new Jax.ColorBuffer         @_vertex_buffers.blended_colors.raw
    @_vertex_buffers.vertices.buf = new Jax.VertexBuffer        @_vertex_buffers.vertices.raw
    @_vertex_buffers.indices.buf  = new Jax.ElementArrayBuffer  @_vertex_buffers.indices.raw
    @_vertex_buffers.normals.buf  = new Jax.NormalBuffer        @_vertex_buffers.normals.raw
    @_vertex_buffers.textures.buf = new Jax.TextureCoordsBuffer @_vertex_buffers.textures.raw
    @_valid = true
    
  ###
  data **must** contain `position`, which is a vec3 containing vertex data.
  It may also contain:
  
  * `normal` - a normalized vec3 containing the vertex direction, defaults to the normalized position
  * `color` - a vec4 containing the vertex color, defaults to white
  * `texture` - a vec2 containing the vertex texture coordinates, defaults to `[0, 0]`
  
  An index will be automatically generated for this vertex and added to the `indices` property
  If an identical vertex has already been added, its index will be added to the `indices` property
  instead.
  
  The vertex index will be returned: either a new one, or the existing one if found.
  ###
  # add_vertex: (data) ->
  #   data.color   = Jax.Color.parse(data.color || "#ffffffff").toVec4()
  #   data.texture or= [0, 0]
  #   data.normal  or= vec3.normalize data.position, [0, 0, 0]
  #   return index if (index = @_vertex_buffers.indexOf data) != -1
  #   index = @_vertex_buffers.push data
  #   @_vertices.push index: index
  #   @invalidate()
  #   return index
  
  ## functions to be (probably) deprecated
  _rebuild_color = vec4.create()
  _rebuild_texture = vec2.create()
  _rebuild_normal = vec3.create()
  _rebuild_vertex = vec3.create()
  _rebuild_data =
    color: _rebuild_color
    texture: _rebuild_texture
    normal: _rebuild_normal
    position: _rebuild_vertex
  rebuild: ->
    return unless @init
    @invalidate()
    @_vertices.splice(0, @_vertices.length)
    @_vertex_buffers.clear()
    [vertices, colors, textures, normals, indices] = [[], [], [], [], []]
    indices_present = indices.length > 0
    @init vertices, colors, textures, normals, indices
    @_vertex_buffers.allocate vertices.length / 3
    for i in [0...vertices.length] by 3
      index = i / 3
      cofs = index * 4
      vofs = i
      tofs = index * 2
      [_rebuild_color[0], _rebuild_color[1], _rebuild_color[2], _rebuild_color[3]] =
        [colors[cofs], colors[cofs+1], colors[cofs+2], colors[cofs+3]]
      [_rebuild_texture[0], _rebuild_texture[1]] = [textures[tofs], textures[tofs+1]]
      [_rebuild_normal[0], _rebuild_normal[1], _rebuild_normal[2]] = [normals[vofs], normals[vofs+1], normals[vofs+2]]
      [_rebuild_vertex[0], _rebuild_vertex[1], _rebuild_vertex[2]] = [vertices[vofs], vertices[vofs+1], vertices[vofs+2]]
      
      # if indices are already known, it will be much faster to push
      # directly on to _vertex_buffers than to exercise @add_vertex
      @_vertices.push index: index
      @_vertex_buffers.set index, _rebuild_data
      unless indices_present
        indices.push index
    @indices = indices
    
  getColorBuffer: -> @validate() unless @_valid; @_vertex_buffers.colors.buf
  getVertexBuffer: -> @validate() unless @_valid; @_vertex_buffers.vertices.buf
  getIndexBuffer: -> @validate() unless @_valid; @_vertex_buffers.indices.buf
  getNormalBuffer: -> @validate() unless @_valid; @_vertex_buffers.normals.buf
  getTextureCoordsBuffer: -> @validate() unless @_valid; @_vertex_buffers.textures.buf
  getTangentBuffer: ->
    @validate() unless @_valid
    @rebuildTangentBuffer() unless @tangent_buffer
    return null unless @tangent_buffer.length
    @tangent_buffer
  rebuildTangentBuffer: -> Jax.Mesh::_makeTangentBuffer.call this
    
  setColor: (c) ->
    if arguments.length > 1 then @color = arguments
    else @color = c
  dispose: ->
    @_vertex_buffers.clear()
    @_initialized = false
    @invalidate()
    
  
Jax.Class.Methods.addMethods.call Mesh, Jax.Events.Methods
  
class Mesh.Triangles extends Mesh
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLES
    super args...

class Mesh.TriangleStrip extends Mesh
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLE_STRIP
    super args...
  
class Mesh.Deprecated extends Mesh.Triangles
  constructor: (args...) ->
    deprecation_message = "Using Jax.Mesh directly has been deprecated. Please use Jax.Mesh.Triangles or a similar variant instead."
    if typeof console isnt 'undefined'
      console.log deprecation_message
    else throw new Error deprecation_message
    super args...
    
Jax.Mesh = Mesh.Deprecated
Jax.Mesh.Base = Mesh
Jax.Mesh.Triangles = Mesh.Triangles
Jax.Mesh.TriangleStrip = Mesh.TriangleStrip
