bufs =
  vec: vec3.create()
  tri: new Jax.Geometry.Triangle()

###
Adds methods for calculating tangents for triangle-based meshes. The mesh
is expected to maintain a `triangleOrder` property, which must be an array
of vertex indices whose length is divisible by 3, with each group of 3
indices representing a triangle.
###
Jax.Mesh.Normals =
  hash: (vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz) ->
    "#{vx},#{vy},#{vz},#{cr},#{cg},#{cb},#{ca},#{ts},#{tt},#{nx},#{ny},#{nz}"
    
  recalculateNormals: ->
    # Calculates vertex normals in 2 passes. First pass, accumulate normals.
    # Second pass, average accumulated normals.
    recalcVec = bufs.vec
    tri = bufs.tri
    recalcVecs = {}
    data = @data
    [vertices, colors, textures, normals] = \
      [data.vertexBuffer, data.colorBuffer, data.textureCoordsBuffer, data.normalBuffer]
      
    hashAt = (i, vx, vy, vz) =>
      [cr, cg, cb, ca, ts, tt, nx, ny, nz] = [                                        \
        colors[i*4], colors[i*4+1], colors[i*4+2], colors[i*4+3],                     \
        textures[i*2], textures[i*2+1],                                               \
        normals[i*3], normals[i*3+1], normals[i*3+2] ]
      @hash vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz
      
    # First pass: accumulation - for each triangle, add the face normal
    # to an array for vertex a, b and c
    triangleOrder = @triangleOrder
    for i in [0...data.length] by 3
      [ai, bi, ci] = [triangleOrder[i], triangleOrder[i+1], triangleOrder[i+2]]
      [ai3, bi3, ci3] = [ai*3, bi*3, ci*3]
      [avx, avy, avz] = [ vertices[ai3], vertices[ai3+1], vertices[ai3+2] ]
      [bvx, bvy, bvz] = [ vertices[bi3], vertices[bi3+1], vertices[bi3+2] ]
      [cvx, cvy, cvz] = [ vertices[ci3], vertices[ci3+1], vertices[ci3+2] ]
      tri.setComponents avx, avy, avz, bvx, bvy, bvz, cvx, cvy, cvz
      normal = tri.getNormal()
      # a
      vhash = hashAt ai, avx, avy, avz
      rn = recalcVecs[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      # b
      vhash = hashAt bi, bvx, bvy, bvz
      rn = recalcVecs[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      # c
      vhash = hashAt ci, cvx, cvy, cvz
      rn = recalcVecs[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      
    # Second pass: average - for each vertex, average the accumulated normals together
    for i in [0...data.length]
      i3 = i * 3
      [vx, vy, vz] = [ vertices[i3], vertices[i3+1], vertices[i3+2] ]
      recalcVec[0] = recalcVec[1] = recalcVec[2] = 0
      vhash = hashAt i, vx, vy, vz
      rn = recalcVecs[vhash]
      rnlen = rn.length
      for ni in [0...rnlen] by 3
        recalcVec[0] += rn[ni  ]
        recalcVec[1] += rn[ni+1]
        recalcVec[2] += rn[ni+2]
      vec3.scale recalcVec, 3 / rnlen # 1 / (rn.length / 3)
      data.normalBuffer[i3  ] = recalcVec[0]
      data.normalBuffer[i3+1] = recalcVec[1]
      data.normalBuffer[i3+2] = recalcVec[2]