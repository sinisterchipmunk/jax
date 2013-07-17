#= require 'jax/geometry'

bufs =
  vec: vec3.create()
  tri: new Jax.Geometry.Triangle()

###
Adds methods for calculating normals for triangle-based meshes. The mesh
is expected to maintain a `triangleOrder` property, which must be an array
of vertex indices whose length is divisible by 3, with each group of 3
indices representing a triangle.
###
Jax.Mesh.Normals =
  recalculateNormals: ->
    # Calculates vertex normals in 2 passes. First pass, accumulate normals.
    # Second pass, average accumulated normals.
    recalcVec = bufs.vec
    tri = bufs.tri
    recalcVecs = {}
    data = @data
    [vertices, colors, textures, normals] = \
      [data.vertexBuffer, data.colorBuffer, data.textureCoordsBuffer, data.normalBuffer]
      
    # First pass: accumulation - for each triangle, add the face normal
    # to an array for vertex a, b and c
    triangleOrder = @triangleOrder
    numTris = triangleOrder.length
    for i in [0...numTris] by 3
      [ai, bi, ci] = [triangleOrder[i], triangleOrder[i+1], triangleOrder[i+2]]
      [ai3, bi3, ci3] = [ai*3, bi*3, ci*3]
      [avx, avy, avz] = [ vertices[ai3], vertices[ai3+1], vertices[ai3+2] ]
      [bvx, bvy, bvz] = [ vertices[bi3], vertices[bi3+1], vertices[bi3+2] ]
      [cvx, cvy, cvz] = [ vertices[ci3], vertices[ci3+1], vertices[ci3+2] ]
      tri.setComponents avx, avy, avz, bvx, bvy, bvz, cvx, cvy, cvz
      normal = tri.getNormal()
      # a
      rn = recalcVecs[ai] or= []
      rn.push normal[0], normal[1], normal[2]
      # b
      rn = recalcVecs[bi] or= []
      rn.push normal[0], normal[1], normal[2]
      # c
      rn = recalcVecs[ci] or= []
      rn.push normal[0], normal[1], normal[2]
      
    # Second pass: average - for each vertex, average the accumulated normals together
    for i in [0...data.length]
      i3 = i * 3
      [vx, vy, vz] = [ vertices[i3], vertices[i3+1], vertices[i3+2] ]
      recalcVec[0] = recalcVec[1] = recalcVec[2] = 0
      rn = recalcVecs[i] or= []
      rnlen = rn.length
      for ni in [0...rnlen] by 3
        recalcVec[0] += rn[ni  ]
        recalcVec[1] += rn[ni+1]
        recalcVec[2] += rn[ni+2]
      vec3.scale recalcVec, recalcVec, 3 / rnlen # 1 / (rn.length / 3)
      data.normalBuffer[i3  ] = recalcVec[0]
      data.normalBuffer[i3+1] = recalcVec[1]
      data.normalBuffer[i3+2] = recalcVec[2]
