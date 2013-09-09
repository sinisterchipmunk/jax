#= require 'jax/mixins/event_emitter'

# A new attempt at sanely managing mesh data.
# Wraps around a single ArrayBuffer with helper methods.
# Must be initialized with a known vertex count.
# Does not reallocate storage space because it's slow.

class FloatBuffer
  constructor: (buffer, itemSize) ->
    @buffer = buffer
    @itemSize = itemSize
    @offset = buffer.byteOffset
  
  bind: -> # no-op for compatibility with Jax.Buffer

class Jax.Mesh.Data
  @include Jax.Mixins.EventEmitter
  
  ###
  Contains extra data points that will be allocated, and the number
  of elements per vertex that will be allocated.
  
  Example: A property called 'moreVertices' with a value of 3 will,
  for a mesh with 9 vertices, allocate an additional buffer with 27
  components.
  
  Elements allocated in this way are not populated with data because
  Jax.Mesh.Data can't know what data belongs in the endpoint.
  ###
  @endpoints: {}
  
  # Returns the smallest unsigned int typed array that can hold
  # the specified number of vertices. Smaller arrays are generally faster.
  chooseIndexArrayFormat = (length) ->
    if length < 256 then return Uint8Array
    else if length < 65536 then return Uint16Array
    # Uint32Array won't actually be used because meshes larger than 65536
    # vertices will be split into multiple meshes. WebGL doesn't actually
    # support more than 65536 vertices.
    Uint32Array
    
  # Returns the calculated length of the ArrayBuffer in bytes for the specified
  # number of vertices and its vertex index buffer.
  calcByteLength = (numVerts, numIndices, indexFormat) ->
    # Hack around a bug in qt by setting BYTES_PER_ELEMENT to the lowest
    # common multiple of all array types to be used, and ensure that allocated
    # data is a multiple of that number.
    multiple = 1
    for name, size of Jax.Mesh.Data.endpoints
      multiple = Math.lcm multiple, size
    multiple = Math.lcm multiple, Float32Array.BYTES_PER_ELEMENT
    multiple = Math.lcm multiple, indexFormat.BYTES_PER_ELEMENT

    sizePerVertex = 0
    for name, size of Jax.Mesh.Data.endpoints
      sizePerVertex += size
    length = sizePerVertex * numVerts * Float32Array.BYTES_PER_ELEMENT + \
              numVerts * 9 * Float32Array.BYTES_PER_ELEMENT + \ # vertices, normals, bitangents
              numVerts * 2 * Float32Array.BYTES_PER_ELEMENT + \ # textures
              numVerts * 8 * Float32Array.BYTES_PER_ELEMENT + \ # colors, tangents
              numIndices * indexFormat.BYTES_PER_ELEMENT        # indices
    if length % multiple != 0
      length += multiple - (length % multiple)
    length
  
  constructor: (vertices = [], colors = [], textures = [], normals = [], \
                indices = [], tangents = [], bitangents = []) ->
    if typeof(vertices) is 'number' then vertices = new Array vertices
    throw new Error "Vertex data length must be given in multiples of 3" if vertices % 3
    # build up indices if none were given
    @_offsets = {}
    @_buffers = {}
    @_wrappers = {}
    @allocateBuffers vertices.length, indices.length || vertices.length / 3
    (indices.push i for i in [0...@length]) if indices.length == 0
    @assignVertexData vertices, colors, textures, normals, tangents, bitangents
    @freezeColors()
    for i in [0...indices.length]
      @indexBuffer[i] = indices[i]
    @usage = GL_STATIC_DRAW
    @target = GL_ARRAY_BUFFER
    @_glBuffers = {}
    @_valid = {}
    
  @define 'color',
    get: -> @_color
    set: (color) ->
      @trigger 'colorChanged'
      @invalidate()
      @_color = Jax.Color.parse color
      for i in [0...@colorBuffer.length] by 4
        @colorBuffer[i  ] = @originalColors[i  ] * @_color.red
        @colorBuffer[i+1] = @originalColors[i+1] * @_color.green
        @colorBuffer[i+2] = @originalColors[i+2] * @_color.blue
        @colorBuffer[i+3] = @originalColors[i+3] * @_color.alpha
        
  @define 'context',
    set: (context) ->
      @_bound = false
      @_context = context
      
  @getter 'tangentBuffer', ->
    @recalculateTangents() if @shouldRecalculateTangents()
    @_tangentBuffer
    
  @getter 'bitangentBuffer', ->
    @recalculateBitangents() if @shouldRecalculateBitangents()
    @_bitangentBuffer

  @getter 'normalBuffer', ->
    @recalculateNormals() if @shouldRecalculateNormals()
    @_normalBuffer

  ###
  Marks the current color data as "original". Changing the color of the
  mesh via `data.color = [...]` will blend the specified color with
  the colors as they are now, regardless of what they were when the mesh
  data was originally constructed.
  ###
  freezeColors: ->
    @originalColors or= new Float32Array @colorBuffer.length
    for i in [0...@colorBuffer.length]
      @originalColors[i] = @colorBuffer[i]
    
  ###
  Marks the mesh data as having changed. The next time the data is bound
  to a GL context, the corresponding GL buffers will be refreshed.
  ###
  invalidate: ->
    for id of @_valid
      @_valid[id] = false
    true
      
  ###
  Deletes all GL buffers. Call this before you delete your handle to this
  data, or risk memory leaks.
  ###
  dispose: ->
    for id, descriptor of @_glBuffers
      # webgl will delete the buffer for us
      # descriptor.gl.deleteBuffer descriptor.buffer
      delete @_glBuffers.id
  
  ###
  Bind the data to the current GL context, or to the specified one if given.
  ###
  bind: (context) ->
    @context = context if context
    id = @_context.id
    gl = @_context.renderer
    unless buffer = @_glBuffers[id]?.buffer
      @_glBuffers[id] =
        gl: gl
        buffer: gl.createBuffer()
      gl.bindBuffer GL_ARRAY_BUFFER, @_glBuffers[id].buffer
      gl.bufferData GL_ARRAY_BUFFER, @_array_buffer, GL_STATIC_DRAW
    else
      gl.bindBuffer GL_ARRAY_BUFFER, buffer
      unless @_valid[id]
        gl.bufferData GL_ARRAY_BUFFER, @_array_buffer, GL_STATIC_DRAW
    @_valid[id] = true
    @_bound = true
    
  ###
  Sets shader variables to refer to data from this mesh, depending on the
  mapping you give it. The `vars` parameter should be the variable set
  as seen in `Jax.Material.Layer#setVariables`.
  
  Example:
  
  class Jax.Material.SomethingCool extends Jax.Material.Layer
    setVariables: (context, mesh, model, vars, pass) ->
      mesh.data.set vars,
        vertices: 'ShaderVertexAttribute'
        colors:   'ShaderColorAttribute'
        textures: 'ShaderTextureCoordsAttribute'
        normals:  'ShaderNormalAttribute'
    
  Valid keys include:
    * vertices:   3-component vertex position data stored as X, Y, Z.
    * colors:     4-component color data stored as R, G, B, A.
    * textures:   2-component texture coordinate data stored as S, T.
    * normals:    3-component vertex normal data stored as X, Y, Z.
    * tangents:   4-component tangent data stored as X, Y, Z, W.
    * bitangents: 3-component bitangent data stored as X, Y, Z.
    
  Face normals are unit-length vectors which point perpendicular to the
  points of a polygon. Vertex normals are the average of all face normals
  shared by a single vertex.
  
  Tangents are unit-length vectors which are parallel to the surface of
  the face, aligned with the S-component of the texture coordinates. Their
  W component is 1 when the tangent matrix is right-handed, -1 when left-handed.
  
  Bitangents are unit-length vectors which are parallel to the surface of
  the face, aligned with the T-component of the texture coordinates. They
  are sometime erroneously referred to as binormals. They can be calculated
  on the fly with the formula `B = Tw * cross(N, T)` where Tw is the W component
  of the corresponding tangent, N is the vertex normal, and T is the first 3
  components of the tangent.
  ###
  set: (vars, mapping) ->
    throw new Error "Jax context for this pass is not set" unless @_context
    throw new Error "Expected two arguments, mapping is undefined" unless mapping isnt undefined
    @bind @_context unless @_bound

    for key, target of mapping
      switch key
        when 'vertices' then vars[target] = @vertexWrapper
        when 'colors'   then vars[target] = @colorWrapper
        when 'textures' then vars[target] = @textureCoordsWrapper
        when 'normals'
          @recalculateNormals() if @shouldRecalculateNormals()
          vars[target] = @normalWrapper
        when 'tangents'
          @recalculateTangents() if @shouldRecalculateTangents()
          vars[target] = @tangentWrapper
        when 'bitangents'
          @recalculateBitangents() if @shouldRecalculateBitangents()
          vars[target] = @bitangentWrapper
        else
          if @_wrappers[key] then vars[target] = @_wrappers[key]
          else
            throw new Error "Mapping key must be one of 'vertices', 'colors', " + \
                            "'textures', 'normals', 'tangents', 'bitangents' (got: #{key})"
        
  ###
  Requests this data set's normals to be recalculated. Note that this does not directly
  perform the recalculation. Instead, it fires a `shouldRecalculateNormals` event, so
  that the object containing this mesh data can control the method in which normals
  are calculated. For example, a point cloud might calculate its normals entirely
  differently from a triangle mesh, and it is not the responsibility of `Jax.Mesh.Data`
  to keep track of which algorithm it should use.
  ###
  recalculateNormals: () ->
    @_shouldRecalculateNormals = false
    @trigger 'shouldRecalculateNormals'
    @invalidate()
    true
    
  ###
  Requests this data set's tangents to be recalculated. Note that this does not directly
  perform the recalculation. Instead, it fires a `shouldRecalculateTangents` event, so
  that the object containing this mesh data can control the method in which tangents
  are calculated.
  ###
  recalculateTangents: () ->
    @_shouldRecalculateTangents = false
    @trigger 'shouldRecalculateTangents'
    @invalidate()
    true
  
  ###
  Requests this data set's bitangents to be recalculated. Note that this does not directly
  perform the recalculation. Instead, it fires a `shouldRecalculateBitangents` event, so
  that the object containing this mesh data can control the method in which bitangents
  are calculated.
  ###
  recalculateBitangents: () ->
    @_shouldRecalculateBitangents = false
    @trigger 'shouldRecalculateBitangents'
    @invalidate()
    true
    
  ###
  Returns true if the mesh data has detected that its normal data should be recalculated.
  ###
  shouldRecalculateNormals:    () -> return @_shouldRecalculateNormals
  shouldRecalculateTangents:   () -> return @_shouldRecalculateTangents
  shouldRecalculateBitangents: () -> return @_shouldRecalculateBitangents
  
  ###
  Allocate or reallocate the typed array buffer and data views. This is called during
  construction and should not be called explicitly unless you really know what you're
  doing.
  ###
  allocateBuffers: (numVertices, numIndices) ->
    @length = numVertices / 3
    @indexFormat = chooseIndexArrayFormat @length
    byteLength = calcByteLength @length, numIndices, @indexFormat
    @_array_buffer = new ArrayBuffer byteLength
    @vertexBufferOffset = 0
    @vertexBuffer = new Float32Array @_array_buffer, @vertexBufferOffset, @length * 3
    @vertexWrapper = new FloatBuffer @vertexBuffer, 3
    @textureCoordsBufferOffset = @vertexBufferOffset + Float32Array.BYTES_PER_ELEMENT * @vertexBuffer.length
    @textureCoordsBuffer = new Float32Array @_array_buffer, @textureCoordsBufferOffset, @length * 2
    @textureCoordsWrapper = new FloatBuffer @textureCoordsBuffer, 2
    @normalBufferOffset = @textureCoordsBufferOffset + Float32Array.BYTES_PER_ELEMENT * @textureCoordsBuffer.length
    @_normalBuffer = new Float32Array @_array_buffer, @normalBufferOffset, @length * 3
    @normalWrapper = new FloatBuffer @_normalBuffer, 3
    @colorBufferOffset = @normalBufferOffset + Float32Array.BYTES_PER_ELEMENT * @_normalBuffer.length
    @colorBuffer = new Float32Array @_array_buffer, @colorBufferOffset, @length * 4
    @colorWrapper = new FloatBuffer @colorBuffer, 4
    @tangentBufferOffset = @colorBufferOffset + Float32Array.BYTES_PER_ELEMENT * @colorBuffer.length
    @_tangentBuffer = new Float32Array @_array_buffer, @tangentBufferOffset, @length * 4
    @tangentWrapper = new FloatBuffer @_tangentBuffer, 4
    @bitangentBufferOffset = @tangentBufferOffset + Float32Array.BYTES_PER_ELEMENT * @tangentBuffer.length
    @_bitangentBuffer = new Float32Array @_array_buffer, @bitangentBufferOffset, @length * 3
    @bitangentWrapper = new FloatBuffer @_bitangentBuffer, 3
    
    offset = @bitangentBufferOffset + Float32Array.BYTES_PER_ELEMENT * @bitangentBuffer.length
    getterFactory = (name) -> -> @_buffers[name]
    for name, size of Jax.Mesh.Data.endpoints
      buffer = new Float32Array @_array_buffer, offset, @length * size
      wrapper = new FloatBuffer buffer, size
      @_offsets[name] = offset
      @_buffers[name] = buffer
      @_wrappers[name] = wrapper
      offset += buffer.length * Float32Array.BYTES_PER_ELEMENT
      Object.defineProperty this, name, get: getterFactory name
    
    @indexBufferOffset = offset
    @indexBuffer = new @indexFormat @_array_buffer, @indexBufferOffset, numIndices

  tmpvec3 = vec3.create()
  
  ###
  Assigns vertex data to the mesh. If color data is omitted, the color of
  each vertex will default to white. Normal data will be calculated if omitted,
  but this takes a lot of time and it's recommended to supply normal data if you
  have it. Texture coords will default to 0 if omitted, resulting in a mesh
  that is incapable of displaying textures (but should work fine with non-textured
  materials).
  
  This is called during construction. While you should be able to get away with
  calling it explicitly, beware that doing so was not the original intended design
  of this class so you may not get the results you were expecting. Also, be sure
  not to assign data for more vertices than memory has been allocated for.
  ###
  assignVertexData: (vertices, colors, textures, normals, tangents, bitangents) ->
    # cache some variables for slightly faster runtime
    [_vbuf, _nbuf, _cbuf, _tbuf, _tans, _btan] = [ \
      @vertexBuffer, @_normalBuffer, @colorBuffer, @textureCoordsBuffer, @_tangentBuffer, @_bitangentBuffer]
    
    length = @length
    @_shouldRecalculateNormals  = (normals.length is 0)
    @_shouldRecalculateTangents = (tangents.length is 0)
    @_shouldRecalculateBitangents = (bitangents.length is 0)
    
    for ofs in [0...length]
      [ofs2, ofs3, ofs4] = [ofs * 2, ofs * 3, ofs * 4]
      _vbuf[ofs3  ] = vertices[ofs3  ]
      _vbuf[ofs3+1] = vertices[ofs3+1]
      _vbuf[ofs3+2] = vertices[ofs3+2]
      # normals don't need a default value because they are not guaranteed to have
      # any value unless explicitly given. Same for tangents. Textures default to 0.
      _nbuf[ofs3  ] = normals[ofs3  ]
      _nbuf[ofs3+1] = normals[ofs3+1]
      _nbuf[ofs3+2] = normals[ofs3+2]
      _tans[ofs4  ] = tangents[ofs4  ]
      _tans[ofs4+1] = tangents[ofs4+1]
      _tans[ofs4+2] = tangents[ofs4+2]
      _tans[ofs4+3] = tangents[ofs4+3]
      _btan[ofs4  ] = bitangents[ofs3  ]
      _btan[ofs4+1] = bitangents[ofs3+1]
      _btan[ofs4+2] = bitangents[ofs3+2]
      _tbuf[ofs2  ] = textures[ofs2  ] || 0
      _tbuf[ofs2+1] = textures[ofs2+1] || 0

      if colors.length <= ofs4
        _cbuf[ofs4] = _cbuf[ofs4+1] = _cbuf[ofs4+2] = _cbuf[ofs4+3] = 1
      else
        _cbuf[ofs4  ] = colors[ofs4  ]
        _cbuf[ofs4+1] = colors[ofs4+1]
        _cbuf[ofs4+2] = colors[ofs4+2]
        _cbuf[ofs4+3] = colors[ofs4+3]
