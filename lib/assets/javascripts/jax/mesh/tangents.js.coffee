tangentBufs =
  v1  : vec3.create(), v2  : vec3.create(), v3: vec3.create(),
  w1  : vec2.create(), w2  : vec2.create(), w3: vec2.create(),
  sdir: vec3.create(), tdir: vec3.create(), n : vec3.create(),
  t   : vec3.create(), tan : vec3.create()

itertri = new Jax.Geometry.Triangle()

###
Adds methods for calculating tangents for triangle-based meshes. The mesh
is expected to maintain a `triangleOrder` property, which must be an array
of vertex indices whose length is divisible by 3, with each group of 3
indices representing a triangle.
###
Jax.Mesh.Tangents =
  ###
  Iterates through each triangle of this mesh, calling the given callback.
  If the callback explicitly returns `false`, then iteration is aborted.
  Returns the number of triangles processed.

  Warning: only a single instance of `Jax.Geometry.Triangle` is used by this
  method. It is NOT safe to maintain an ongoing reference to the yielded
  triangle!
  ###
  eachTriangle: (callback) ->
    vbuf = @data.vertexBuffer
    triangleOrder = @triangleOrder
    triangleOrderLength = triangleOrder.length
    numTris = 0
    for a in [0...triangleOrderLength] by 3
      numTris += 1
      [i1, i2, i3] = [triangleOrder[a], triangleOrder[a+1], triangleOrder[a+2]]
      i1x = i1 * 3
      i1y = i1x * 3 + 1
      i1z = i1x * 3 + 2
      i2x = i2 * 3
      i2y = i2x * 3 + 1
      i2z = i2x * 3 + 2
      i3x = i3 * 3
      i3y = i3x * 3 + 1
      i3z = i3x * 3 + 2
      itertri.setComponents vbuf[i1x], vbuf[i1y], vbuf[i1z],
                            vbuf[i2x], vbuf[i2y], vbuf[i2z],
                            vbuf[i3x], vbuf[i3y], vbuf[i3z]
      return numTris if callback(itertri) is false
    numTris

  recalculateBitangents: ->
    data = @data
    @recalculateTangents() if data.shouldRecalculateTangents()
    [tangents, bitangents, normals] = [data.tangentBuffer, data.bitangentBuffer, data.normalBuffer]
    len = data.length
    bitangent = tangentBufs.tan
    normal = tangentBufs.n
    for i in [0...len]
      i3 = i * 3
      i4 = i * 4
      bitangent[0] = tangents[i4  ]
      bitangent[1] = tangents[i4+1]
      bitangent[2] = tangents[i4+2]
      normal[0] = normals[i3  ]
      normal[1] = normals[i3+1]
      normal[2] = normals[i3+2]
      vec3.cross bitangent, normal, bitangent
      vec3.scale tangents[i4+3], bitangent
      bitangents[i3  ] = bitangent[0]
      bitangents[i3+1] = bitangent[1]
      bitangents[i3+2] = bitangent[2]
    
  recalculateTangents: ->
    # normals are necessary in order to calculate tangents, so make sure we have them
    @recalculateNormals() if @data.shouldRecalculateNormals()
    
    data = @data
    numTangents = 3 * data.length
    buf = new ArrayBuffer numTangents * Float32Array.BYTES_PER_ELEMENT * 2
    tan1 = new Float32Array buf, 0, numTangents
    tan2 = new Float32Array buf, numTangents * Float32Array.BYTES_PER_ELEMENT, numTangents
    
    [v1, v2, v3] = [tangentBufs.v1, tangentBufs.v2, tangentBufs.v3]
    [w1, w2, w3] = [tangentBufs.w1, tangentBufs.w2, tangentBufs.w3]
    [sdir, tdir] = [tangentBufs.sdir, tangentBufs.tdir]
    [n, t, tan]  = [tangentBufs.n, tangentBufs.t, tangentBufs.tan]

    set = (v, w, i, i3) ->
      v[0] = data.vertexBuffer[i3]
      v[1] = data.vertexBuffer[i3+1]
      v[2] = data.vertexBuffer[i3+2]
      w[0] = data.textureCoordsBuffer[i*2]
      w[1] = data.textureCoordsBuffer[i*2+1]
    triangleOrder = @triangleOrder
    triangleOrderLength = triangleOrder.length
    for a in [0...triangleOrderLength] by 3
      [i1, i2, i3] = [triangleOrder[a], triangleOrder[a+1], triangleOrder[a+2]]
      [i13, i23, i33] = [i1 * 3, i2 * 3, i3 * 3]
      set v1, w1, i1, i13
      set v2, w2, i2, i23
      set v3, w3, i3, i33
      x1 = v2[0] - v1[0]
      x2 = v3[0] - v1[0]
      y1 = v2[1] - v1[1]
      y2 = v3[1] - v1[1]
      z1 = v2[2] - v1[2]
      z2 = v3[2] - v1[2]
      s1 = w2[0] - w1[0]
      s2 = w3[0] - w1[0]
      t1 = w2[1] - w1[1]
      t2 = w3[1] - w1[1]
      
      r = 1 / (s1 * t2 - s2 * t1)
      # this will happen with degenerate triangles, no big deal since
      # those tris are not seen anyway
      if r == (1 / 0) then r = 0
      sdir[0] = (t2 * x1 - t1 * x2) * r
      sdir[1] = (t2 * y1 - t1 * y2) * r
      sdir[2] = (t2 * z1 - t1 * z2) * r
      tdir[0] = (s1 * x2 - s2 * x1) * r
      tdir[1] = (s1 * y2 - s2 * y1) * r
      tdir[2] = (s1 * z2 - s2 * z1) * r
      tan1[i13  ] += sdir[0]
      tan1[i13+1] += sdir[1]
      tan1[i13+2] += sdir[2]
      tan1[i23  ] += sdir[0]
      tan1[i23+1] += sdir[1]
      tan1[i23+2] += sdir[2]
      tan1[i33  ] += sdir[0]
      tan1[i33+1] += sdir[1]
      tan1[i33+2] += sdir[2]
      tan2[i13  ] += tdir[0]
      tan2[i13+1] += tdir[1]
      tan2[i13+2] += tdir[2]
      tan2[i23  ] += tdir[0]
      tan2[i23+1] += tdir[1]
      tan2[i23+2] += tdir[2]
      tan2[i33  ] += tdir[0]
      tan2[i33+1] += tdir[1]
      tan2[i33+2] += tdir[2]
    num = data.tangentBuffer.length / 4
    for a in [0...num]
      a3 = a * 3
      a4 = a * 4
      n[0] = data.normalBuffer[a3]
      n[1] = data.normalBuffer[a3+1]
      n[2] = data.normalBuffer[a3+2]
      t[0] = tan1[a3]
      t[1] = tan1[a3+1]
      t[2] = tan1[a3+2]
      
      # Gram-Schmidt orthogonalize
      dot = vec3.dot n, t
      x = t[0] - n[0] * dot
      y = t[1] - n[1] * dot
      z = t[2] - n[2] * dot
      normalize = 1.0 / Math.sqrt(x * x + y * y + z * z)
      data.tangentBuffer[a4  ] = x * normalize
      data.tangentBuffer[a4+1] = y * normalize
      data.tangentBuffer[a4+2] = z * normalize
      
      # Calculate handedness
      tan[0] = tan2[a3  ]
      tan[1] = tan2[a3+1]
      tan[2] = tan2[a3+2]
      data.tangentBuffer[a4+3] = (if vec3.dot(vec3.cross(n, n, t), tan) < 0 then -1 else 1)