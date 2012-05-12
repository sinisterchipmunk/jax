class Jax.Mesh.VertexBuffers
  PRECISION = 6
  hashify = (position, normal, color, texture) ->
    "#{position[0].toFixed PRECISION},#{position[1].toFixed PRECISION},#{position[2].toFixed PRECISION};" +
    "#{normal[0].toFixed PRECISION},#{normal[1].toFixed PRECISION},#{normal[2].toFixed PRECISION};" +
    "#{color[0].toFixed PRECISION},#{color[1].toFixed PRECISION},#{color[2].toFixed PRECISION},#{color[3].toFixed PRECISION};" +
    "#{texture[0].toFixed PRECISION},#{texture[1].toFixed PRECISION}"
  
  constructor: ->
    @vertices      = new Jax.ChunkedArray Float32Array
    @normals       = new Jax.ChunkedArray Float32Array
    @colors        = new Jax.ChunkedArray Float32Array
    @textures      = new Jax.ChunkedArray Float32Array
    @indices       = new Jax.ChunkedArray Uint16Array
    @blended_colors= new Jax.ChunkedArray Float32Array
    @rehash()
  
  clear: ->
    @allocate 0
    
  allocate: (number) ->
    @vertices.array number * 3
    @normals.array number * 3
    @colors.array number * 4
    @textures.array number * 2
    @blended_colors.array number * 4
    @library.allocated = number
    
  set: (index, data) ->
    @library[hashify data.position, data.normal, data.color, data.texture] = index
    if index >= @library.allocated
      throw new Error "Memory not allocated for #{index} vertices"
    vertices = @vertices.subdivide 3
    normals = @normals.subdivide 3
    colors = @colors.subdivide 4
    blended_colors = @blended_colors.subdivide 4
    textures = @textures.subdivide 2
    vec3.set data.position, vertices[index]
    vec3.set data.normal,   normals[index]
    vec4.set data.color,    colors[index]
    vec4.set data.color,    blended_colors[index]
    vec2.set data.texture,  textures[index]
    
  push: (data) ->
    index = @vertices.length / 3
    @vertices.push data.position...
    @normals.push data.normal...
    @colors.push data.color...
    @textures.push data.texture...
    @blended_colors.push data.color...
    @indices.push index
    index
    
  ###
  Rebuilds all of the vertex hashes used in indexing. Call this after
  making changes to the mesh data.
  ###
  rehash: ->
    vertices = @vertices.subdivide 3
    normals = @normals.subdivide 3
    colors = @colors.subdivide 4
    textures = @textures.subdivide 2
    @library =
      allocated: vertices.length
    for i in [0...vertices.length]
      @library[hashify vertices[i], normals[i], colors[i], textures[i]] = i
    
  indexOf: (data) ->
    hash = hashify data.position, data.normal, data.color, data.texture
    if (index = @library[hash]) isnt undefined
      return index
    return -1
