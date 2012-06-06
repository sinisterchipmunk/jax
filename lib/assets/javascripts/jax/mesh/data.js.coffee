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
  # Returns the smallest unsigned int typed array that can hold
  # the specified number of vertices. Smaller arrays are generally faster.
  chooseIndexArrayFormat = (length) ->
    if length < 256 then return Uint8Array
    else if length < 65536 then return Uint16Array
    
    # FIXME meshes with more vertices can't actually be rendered at all
    # because only GL_UNSIGNED_BYTE or GL_UNSIGNED_SHORT are supported;
    # in this case the mesh should be split into two meshes
    # but for now we'll let it bubble up as GL_INVALID_ENUM during render.
    Uint32Array
    
  # Returns the calculated length of the ArrayBuffer in bytes for the specified
  # number of vertices and its vertex index buffer.
  calcByteLength = (numVerts, numIndices, indexFormat) ->
    numVerts * 6 * Float32Array.BYTES_PER_ELEMENT + # vertices, normals
    numVerts * 2 * Float32Array.BYTES_PER_ELEMENT + # textures
    numVerts * 4 * Float32Array.BYTES_PER_ELEMENT +   # colors
    numIndices * indexFormat.BYTES_PER_ELEMENT      # indices
  
  constructor: (vertices = [], colors = [], textures = [], normals = [], indices = []) ->
    throw new Error "Vertex data length must be given in multiples of 3" if vertices % 3
    # build up indices if none were given
    @allocateBuffers vertices.length, indices.length || vertices.length / 3
    (indices.push i for i in [0...@length]) if indices.length == 0
    # @vertices = new Array @length
    @assignVertexData vertices, colors, textures, normals
    @originalColors = (c for c in @colorBuffer)
    for i in [0...indices.length]
      @indexBuffer[i] = indices[i]
    @usage = GL_STATIC_DRAW
    @target = GL_ARRAY_BUFFER
    @_glBuffers = {}
    
  @define 'color'
    set: (color) ->
      @_color = Jax.Color.parse color
      for i in [0...@colorBuffer.length] by 4
        @colorBuffer[i  ] = @originalColors[i  ] * @_color.red
        @colorBuffer[i+1] = @originalColors[i+1] * @_color.green
        @colorBuffer[i+2] = @originalColors[i+2] * @_color.blue
        @colorBuffer[i+3] = @originalColors[i+3] * @_color.alpha
        
  @define 'context'
    set: (context) ->
      @_bound = false
      @_context = context
      
  dispose: ->
    for id, descriptor of @_glBuffers
      descriptor.gl.deleteBuffer descriptor.buffer
      delete @_glBuffers.id
      
  bind: () ->
    id = @_context.id
    gl = @_context.gl
    unless buffer = @_glBuffers[id]?.buffer
      @_glBuffers[id] =
        gl: gl
        buffer: gl.createBuffer()
      gl.bindBuffer GL_ARRAY_BUFFER, @_glBuffers[id].buffer
      gl.bufferData GL_ARRAY_BUFFER, @_array_buffer, GL_STATIC_DRAW
    else
      gl.bindBuffer GL_ARRAY_BUFFER, buffer
    @_bound = true
    
  refresh: (context) ->
    @context = context if context
    @bind()
    @_context.gl.bufferData GL_ARRAY_BUFFER, @_array_buffer, GL_STATIC_DRAW
  
  set: (vars, mapping) ->
    throw new Error "Jax context for this pass is not set" unless @_context
    @bind @_context unless @_bound

    for key, target of mapping
      switch key
        when 'vertices' then vars.set target, @vertexWrapper
        when 'colors'   then vars.set target, @colorWrapper
        when 'textures' then vars.set target, @textureCoordsWrapper
        when 'normals'  then vars.set target, @normalWrapper
        else throw new Error "Mapping key must be one of 'vertices', 'colors', 'textures', 'normals'"
    
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
    @normalBuffer = new Float32Array @_array_buffer, @normalBufferOffset, @length * 3
    @normalWrapper = new FloatBuffer @normalBuffer, 3
    @colorBufferOffset = @normalBufferOffset + Float32Array.BYTES_PER_ELEMENT * @normalBuffer.length
    @colorBuffer = new Float32Array @_array_buffer, @colorBufferOffset, @length * 4
    @colorWrapper = new FloatBuffer @colorBuffer, 4
    @indexBufferOffset = @colorBufferOffset + Float32Array.BYTES_PER_ELEMENT * @colorBuffer.length
    @indexBuffer = new @indexFormat @_array_buffer, @indexBufferOffset, numIndices

  tmpvec3 = vec3.create()
  assignVertexData: (vertices, colors, textures, normals) ->
    # cache some variables for slightly faster runtime
    [_vertices, _vbuf, _nbuf, _cbuf, _tbuf] = [@vertices, @vertexBuffer, @normalBuffer, @colorBuffer, @textureCoordsBuffer]
    [_vofs, _nofs, _cofs, _tofs] = [@vertexBufferOffset, @normalBufferOffset, @colorBufferOffset, @textureCoordsBufferOffset]
    _vsize = 3 * Float32Array.BYTES_PER_ELEMENT
    _tsize = 2 * Float32Array.BYTES_PER_ELEMENT
    _csize = 4 * Float32Array.BYTES_PER_ELEMENT
    _array_buffer = @_array_buffer
    length = @length
    
    for ofs in [0...length]
      # _vertices[ofs] =
      #   position: new Float32Array _array_buffer, _vofs + ofs * _vsize, 3
      #   normal: new Float32Array   _array_buffer, _nofs + ofs * _vsize, 3
      #   color: new Uint8Array      _array_buffer, _cofs + ofs * _csize, 4
      #   texture: new Float32Array  _array_buffer, _tofs + ofs * _tsize, 2
      [vofs, cofs, tofs] = [ofs * 3, ofs * 4, ofs * 2]
      _vbuf[vofs  ]  = vertices[vofs  ]
      _vbuf[vofs+1]  = vertices[vofs+1]
      _vbuf[vofs+2]  = vertices[vofs+2]
      if normals.length <= vofs
        tmpvec3[0] = vertices[vofs]
        tmpvec3[1] = vertices[vofs+1]
        tmpvec3[2] = vertices[vofs+2]
        vec3.normalize tmpvec3
        _nbuf[vofs  ] = tmpvec3[0]
        _nbuf[vofs+1] = tmpvec3[1]
        _nbuf[vofs+2] = tmpvec3[2]
      else
        _nbuf[vofs  ]  = normals[vofs  ]
        _nbuf[vofs+1]  = normals[vofs+1]
        _nbuf[vofs+2]  = normals[vofs+2]
      if colors.length <= cofs
        _cbuf[cofs] = _cbuf[cofs+1] = _cbuf[cofs+2] = _cbuf[cofs+3] = 1
      else
        _cbuf[cofs  ]   = colors[cofs  ]
        _cbuf[cofs+1]   = colors[cofs+1]
        _cbuf[cofs+2]   = colors[cofs+2]
        _cbuf[cofs+3]   = colors[cofs+3]
      if textures.length <= tofs
        _tbuf[tofs] = _tbuf[tofs+1] = 0
      else
        _tbuf[tofs  ] = textures[tofs  ]
        _tbuf[tofs+1] = textures[tofs+1]
