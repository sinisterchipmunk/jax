class Jax.Mesh.Triangles extends Jax.Mesh.Base
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLES
    super args...

  hash = (vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz) ->
    "#{vx},#{vy},#{vz},#{cr},#{cg},#{cb},#{ca},#{ts},#{tt},#{nx},#{ny},#{nz}"

  recalcTri = new Jax.Geometry.Triangle()
  recalcNormal = vec3.create()
  recalculateNormals: ->
    # Calculates vertex normals in 2 passes. First pass, accumulate normals.
    # Second pass, average accumulated normals.
    tri = recalcTri
    recalcNormals = {}
    data = @data
    [vertices, colors, textures, normals] = \
      [data.vertexBuffer, data.colorBuffer, data.textureCoordsBuffer, data.normalBuffer]
      
    hashAt = (i, vx, vy, vz) ->
      [cr, cg, cb, ca, ts, tt, nx, ny, nz] = [                                        \
        colors[i*4], colors[i*4+1], colors[i*4+2], colors[i*4+3],                     \
        textures[i*2], textures[i*2+1],                                               \
        normals[i*3], normals[i*3+1], normals[i*3+2] ]
      hash vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz
      
    # First pass: accumulation - for each triangle, add the face normal
    # to an array for vertex a, b and c
    for i in [0...data.length] by 3
      [ai, bi, ci] = [i, i+1, i+2]
      [avx, avy, avz] = [ vertices[ai*3], vertices[ai*3+1], vertices[ai*3+2] ]
      [bvx, bvy, bvz] = [ vertices[bi*3], vertices[bi*3+1], vertices[bi*3+2] ]
      [cvx, cvy, cvz] = [ vertices[ci*3], vertices[ci*3+1], vertices[ci*3+2] ]
      tri.setComponents avx, avy, avz, bvx, bvy, bvz, cvx, cvy, cvz
      normal = tri.getNormal()
      # a
      vhash = hashAt ai, avx, avy, avz
      rn = recalcNormals[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      # b
      vhash = hashAt bi, bvx, bvy, bvz
      rn = recalcNormals[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      # c
      vhash = hashAt ci, cvx, cvy, cvz
      rn = recalcNormals[vhash] or= []
      rn.push normal[0], normal[1], normal[2]
      
    # Second pass: average - for each vertex, average the accumulated normals together
    for i in [0...data.length]
      [vx, vy, vz] = [ vertices[i*3], vertices[i*3+1], vertices[i*3+2] ]
      recalcNormal[0] = recalcNormal[1] = recalcNormal[2] = 0
      vhash = hashAt i, vx, vy, vz
      rn = recalcNormals[vhash]
      rnlen = rn.length
      for ni in [0...rnlen] by 3
        recalcNormal[0] += rn[ni  ]
        recalcNormal[1] += rn[ni+1]
        recalcNormal[2] += rn[ni+2]
      vec3.scale recalcNormal, 3 / rnlen # 1 / (rn.length / 3)
      data.normalBuffer[i*3  ] = recalcNormal[0]
      data.normalBuffer[i*3+1] = recalcNormal[1]
      data.normalBuffer[i*3+2] = recalcNormal[2]

  split: (vertices, colors, textures, normals, indices) ->
    max = 65535
    return null if vertices.length <= max * 3
    _c = []
    _t = []
    _n = []
    _v = []
    _i = []
    tracker = {}
    
    # It's easier to unravel indices and put flat vertices into the new vertices array,
    # but it's more efficient to track those vertices and create corresponding unique
    # indices on the fly. Since we have to iterate through indices either way, performance
    # difference is negligible.
      
    for i in [0...indices.length] by 3
      i1 = indices[i]
      i2 = indices[i+1]
      i3 = indices[i+2]
      if i1 > max || i2 > max || i3 > max
        [vx, vy, vz] = [vertices[i1*3], vertices[i1*3+1], vertices[i1*3+2]]
        [nx, ny, nz] = [normals[i1*3],  normals[i1*3+1],  normals[i1*3+2] ]
        [ts, tt    ] = [textures[i1*2], textures[i1*2+1]]
        [cr, cg, cb, ca] = [colors[i1*4], colors[i1*4+1], colors[i1*4+2], colors[i1*4+3]]
        _h = hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length

        [vx, vy, vz] = [vertices[i2*3], vertices[i2*3+1], vertices[i2*3+2]]
        [nx, ny, nz] = [normals[i2*3],  normals[i2*3+1],  normals[i2*3+2] ]
        [ts, tt    ] = [textures[i2*2], textures[i2*2+1]]
        [cr, cg, cb, ca] = [colors[i2*4], colors[i2*4+1], colors[i2*4+2], colors[i2*4+3]]
        _h = hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length
          
        [vx, vy, vz] = [vertices[i3*3], vertices[i3*3+1], vertices[i3*3+2]]
        [nx, ny, nz] = [normals[i3*3],  normals[i3*3+1],  normals[i3*3+2] ]
        [ts, tt    ] = [textures[i3*2], textures[i3*2+1]]
        [cr, cg, cb, ca] = [colors[i3*4], colors[i3*4+1], colors[i3*4+2], colors[i3*4+3]]
        _h = hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length

        indices.splice i, 3
        i -= 3
        
    vertices.splice max*3, vertices.length
    colors.splice max*4, colors.length if colors.length
    textures.splice max*2, textures.length if textures.length
    normals.splice max*3, normals.length if normals.length
        
    newMesh = new (this.__proto__.constructor)
      init: (v, c, t, n, i) ->
        (v.push __v for __v in _v)
        (c.push __c for __c in _c) if _c
        (t.push __t for __t in _t) if _t
        (n.push __n for __n in _n) if _n
        (i.push __i for __i in _i)