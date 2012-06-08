class Jax.Mesh.Triangles extends Jax.Mesh.Base
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLES
    super args...

  hash = (vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz) ->
    "#{vx},#{vy},#{vz},#{cr},#{cg},#{cb},#{ca},#{ts},#{tt},#{nx},#{ny},#{nz}"

  split: (vertices, colors, textures, normals, indices) ->
    max = 65535
    return null if vertices.length <= max * 3
    _c = []
    _t = []
    _n = []
    _v = []
    _i = []
    tracker = {}
      
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