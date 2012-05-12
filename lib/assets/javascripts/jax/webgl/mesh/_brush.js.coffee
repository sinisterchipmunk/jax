#= require 'jax/webgl/mesh'

###
The Mesh Brush is used to incrementally build a 3D mesh using a series
of helper methods.

== Basic Usage

Here's an example of using `Brush` to paint a multi-colored
triangle:

    brush = new Brush()
    
    brush.triangles (b) ->
      b.color = "#f00"       # red
      b.add_vertex  0,  1, 0 # top
      b.color = "#0f0"       # green
      b.add_vertex -1, -1, 0 # bottom-left
      b.color = "#00f"       # blue
      b.add_vertex  1, -1, 0 # bottom-right
    
If the triangle is to be a single solid color, you can consolidate the
vertices to a single call:

    brush.triangles (b) ->
      b.color = "#00f"           # blue
      b.add_triangle  0,  1, 0,  # top
                     -1, -1, 0,  # bottom-left
                      1, -1, 0   # bottom-right

== Vertex Indices

There's no need to directly track vertex indices at all because Brush will
automatically generate them and remove duplicate vertices for you. All you
need to do is supply the vertices in the order they should be rendered.

== Normals and texture coordinates

You can omit normal data from the triangles and Brush will be smart enough
to generate normals for you, but this takes some time in JavaScript and is
not recommended for production environments. Instead, you should supply both
normal and texture data for every mesh you build. You can do that like so:

    # Supplying normal data:
    brush.triangles (b) ->
      b.add_normal 0, 0, 1
      b.add_normals 0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
      b.add_face_normal 0, 0, 1

      # Supplying texture data:
      b.add_texture 0, 0
      b.add_textures 0, 0,
                     0, 1,
                     1, 1

== Shapes Other Than Triangles

WebGL supports 7 types of shapes: triangles, triangle strips, triangle fans,
lines, line strips, line loops and points. Brush supports all 7.

The default type is Points -- that is, each vertex added to the basic Brush
instance represents a dot on the screen. Any of the other shapes can be used
by invoking the method of the same name and supplying a callback, and types can
be mixed and matched if you have a mesh that consists of multiple types.

Here are some examples:

    # add a single point vertex
    brush.add_vertex 0, 0, 0

    # create a square out of a line loop
    brush.line_loop (b) ->
      b.add_vertices  0, 0, 0,
                      0, 1, 0,
                      1, 1, 0,
                      1, 0, 0
                      
    # create a quad out of a triangle strip
    brush.triangle_strip (b) ->
      b.add_vertices  0, 0, 0,
                      0, 1, 0,
                      1, 0, 0,
                      1, 1, 0

###

class Jax.Mesh.Brush
  push_element = (array, components...) ->
    raw = array.raw
    index = null
    for i in [0...raw.length] by components.length
      unless false in (Math.equalish raw[i+j], components[j] for j in [0...components.length])
        return i / components.length
    index = array.length / components.length
    array.push components...
    index
  
  constructor: ->
    @_color = new Color 1, 1, 1, 1
    @_vertices = new Jax.ChunkedArray Float32Array
    @_indices = new Jax.ChunkedArray Uint16Array
    @_normals = new Jax.ChunkedArray Float32Array
    
  add_vertex: (x, y, z) ->
    @_indices.push push_element @_vertices, x, y, z
    
  add_vertices: ->
    throw new Error "Argument count must be divisible by 3" if arguments.length % 3 != 0
    for i in [0...arguments.length] by 3
      @add_vertex arguments[i], arguments[i+1], arguments[i+2]
  
  add_normal: (x, y, z) ->
    push_element @_normals, x, y, z
    
  add_normals: ->
    throw new Error "Argument count must be divisible by 3" if arguments.length % 3 != 0
    for i in [0...arguments.length] by 3
      @add_normal arguments[i], arguments[i+1], arguments[i+2]
    
  @define 'vertices', get: -> @_vertices.raw
  @define 'indices', get: -> @_indices.raw
  @define 'normals', get: -> @_normals.raw
  @define 'color'
    get: -> @_color
    set: (value) -> @_color = Color.parse value
    