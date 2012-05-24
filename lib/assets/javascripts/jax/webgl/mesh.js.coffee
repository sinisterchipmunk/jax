#= require 'jax/core/coffee_patterns'
#= require 'jax/color'
#= require "jax/webgl/core/events"
#= require 'jax/webgl/core/buffer'
#= require_self
#= require 'jax/webgl/mesh/data'
#= require 'jax/webgl/mesh/bounds'
#= require 'jax/webgl/mesh/vertex_buffers'
#= require 'jax/webgl/mesh/tangent_space'

class Mesh
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
      
  @define 'color'
    get: -> @_color
    set: (color) ->
      @invalidate()
      @_color = color
      @data.color = @_color
      @fireEvent 'color_changed'

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
    
  recalcPosition = vec3.create()
  recalculateBounds: ->
    [left, right, top, bottom, front, back] = [@_bounds.left, @_bounds.right, @_bounds.top,
                                               @_bounds.bottom, @_bounds.front, @_bounds.back]
    center = @_bounds.center
    length = @data.vertexBuffer.length
    position = recalcPosition
    for i in [0...length] by 3
      position[0] = @data.vertexBuffer[i]
      position[1] = @data.vertexBuffer[i+1]
      position[2] = @data.vertexBuffer[i+2]
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
    
  ###
  If the mesh has been invalidated, this function will refresh its vertex information and relevant
  WebGL buffers.
  ###
  validate: ->
    return if @_valid
    @rebuild() unless @_initialized
    @_material or= Jax.Material.find "default"
    @recalculateBounds()
    if @data.colors_buf
      @data.colors_buf.refresh()
      @data.vertices_buf.refresh()
      @data.normals_buf.refresh()
      @data.textures_buf.refresh()
      @data.indices_buf.refresh()
    else
      @data.colors_buf   = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array,   GL_STATIC_DRAW, @data.colorBuffer, 4
      @data.vertices_buf = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, @data.vertexBuffer, 3
      @data.normals_buf  = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, @data.normalBuffer, 3
      @data.textures_buf = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, @data.textureCoordsBuffer, 2
      @data.indices_buf  = new Jax.Buffer GL_ELEMENT_ARRAY_BUFFER, @data.indexFormat, GL_STATIC_DRAW, @data.indexBuffer, 1
    @_valid = true
    
  ## functions to be (probably) deprecated
  rebuild: ->
    return unless @init
    @invalidate()
    [vertices, colors, textures, normals, indices] = [[], [], [], [], []]
    @init vertices, colors, textures, normals, indices
    @data = new Jax.Mesh.Data vertices, colors, textures, normals, indices
    @data.color = @_color
    
  getColorBuffer:         -> @validate() unless @_valid; @data.colors_buf
  getVertexBuffer:        -> @validate() unless @_valid; @data.vertices_buf
  getIndexBuffer:         -> @validate() unless @_valid; @data.indices_buf
  getNormalBuffer:        -> @validate() unless @_valid; @data.normals_buf
  getTextureCoordsBuffer: -> @validate() unless @_valid; @data.textures_buf
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
