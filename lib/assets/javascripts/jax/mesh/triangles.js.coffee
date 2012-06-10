class Jax.Mesh.Triangles extends Jax.Mesh.Base
  @include Jax.Mesh.Tangents
  @include Jax.Mesh.Normals
  
  # Precision used in hashing algorithm. This is important because of floating
  # point inaccuracies, which could cause vertices which should have the same
  # hash, to have different ones.
  PRECISION = 6

  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLES
    super args...
    @triangleOrder = []
    @addEventListener 'validated', => @updateTriangleOrder()
    
  updateTriangleOrder: ->
    triangleOrder = @triangleOrder
    indices = @data.indexBuffer
    numIndices = indices.length
    triangleOrder.splice 0, triangleOrder.length
    for i in [0...numIndices] by 3
      triangleOrder.push indices[i], indices[i+1], indices[i+2]

  hash: (vx, vy, vz, cr=0, cg=0, cb=0, ca=0, ts=0, tt=0, nx=0, \
         ny=0, nz=0, ax=0, ay=0, az=0, aw=0, bx=0, bY=0, bz=0) ->
    "#{vx.toFixed PRECISION},#{vy.toFixed PRECISION},#{vz.toFixed PRECISION}," + \
    "#{cr.toFixed PRECISION},#{cg.toFixed PRECISION},#{cb.toFixed PRECISION}," + \
    "#{ca.toFixed PRECISION},#{ts.toFixed PRECISION},#{tt.toFixed PRECISION}," + \
    "#{nx.toFixed PRECISION},#{ny.toFixed PRECISION},#{nz.toFixed PRECISION}," + \
    "#{ax.toFixed PRECISION},#{ay.toFixed PRECISION},#{az.toFixed PRECISION}," + \
    "#{aw.toFixed PRECISION},#{bx.toFixed PRECISION},#{bY.toFixed PRECISION}," + \
    "#{bz.toFixed PRECISION}"

  split: (vertices, colors, textures, normals, indices, tangents, bitangents) ->
    max = 65535
    return null if vertices.length <= max * 3
    _c = []
    _t = []
    _n = []
    _v = []
    _i = []
    _a = [] # tangents
    _b = [] # bitangents
    tracker = {}
    
    # It's easier to unravel indices and put flat vertices into the new vertices array,
    # but it's more efficient to track those vertices and create corresponding unique
    # indices on the fly. Since we have to iterate through indices either way, performance
    # difference is negligible.
    
    # compensate for un-populated indices by building them up from vertices
    if indices.length is 0
      indices = (i / 3 for i in [0...vertices.length] by 3)
      
    for i in [0...indices.length] by 3
      i1 = indices[i]
      i2 = indices[i+1]
      i3 = indices[i+2]
      if i1 > max || i2 > max || i3 > max
        [vx, vy, vz] = [vertices[i1*3], vertices[i1*3+1], vertices[i1*3+2]]
        [nx, ny, nz] = [normals[i1*3],  normals[i1*3+1],  normals[i1*3+2] ]
        [ts, tt    ] = [textures[i1*2], textures[i1*2+1]]
        [cr, cg, cb, ca] = [colors[i1*4], colors[i1*4+1], colors[i1*4+2], colors[i1*4+3]]
        [ax, ay, az, aw] = [tangents[i1*4], tangents[i1*4+1], tangents[i1*4+2], tangents[i1*4+3]]
        [bx, bY, bz]     = [bitangents[i1*3], bitangents[i1*3+1], bitangents[i1*3+2]]
        _h = @hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length
          _a.push ax, ay, az, aw                        if tangents.length
          _b.push bx, bY, bz                            if bitangents.length

        [vx, vy, vz] = [vertices[i2*3], vertices[i2*3+1], vertices[i2*3+2]]
        [nx, ny, nz] = [normals[i2*3],  normals[i2*3+1],  normals[i2*3+2] ]
        [ts, tt    ] = [textures[i2*2], textures[i2*2+1]]
        [cr, cg, cb, ca] = [colors[i2*4], colors[i2*4+1], colors[i2*4+2], colors[i2*4+3]]
        [ax, ay, az, aw] = [tangents[i2*4], tangents[i2*4+1], tangents[i2*4+2], tangents[i2*4+3]]
        [bx, bY, bz]     = [bitangents[i2*3], bitangents[i2*3+1], bitangents[i2*3+2]]
        _h = @hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length
          _a.push ax, ay, az, aw                        if tangents.length
          _b.push bx, bY, bz                            if bitangents.length
          
        [vx, vy, vz] = [vertices[i3*3], vertices[i3*3+1], vertices[i3*3+2]]
        [nx, ny, nz] = [normals[i3*3],  normals[i3*3+1],  normals[i3*3+2] ]
        [ts, tt    ] = [textures[i3*2], textures[i3*2+1]]
        [cr, cg, cb, ca] = [colors[i3*4], colors[i3*4+1], colors[i3*4+2], colors[i3*4+3]]
        [ax, ay, az, aw] = [tangents[i3*4], tangents[i3*4+1], tangents[i3*4+2], tangents[i3*4+3]]
        [bx, bY, bz]     = [bitangents[i3*3], bitangents[i3*3+1], bitangents[i3*3+2]]
        _h = @hash vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz
        if tracker[_h] then _i.push tracker[_h]
        else
          _i.push tracker[_h] = _v.length / 3
          _v.push vx, vy, vz
          _c.push cr, cg, cb, ca                        if colors.length
          _t.push ts, tt                                if textures.length
          _n.push nx, ny, nz                            if normals.length
          _a.push ax, ay, az, aw                        if tangents.length
          _b.push bx, bY, bz                            if bitangents.length

        indices.splice i, 3
        i -= 3
        
    vertices.splice max*3, vertices.length
    colors.splice max*4, colors.length if colors.length
    textures.splice max*2, textures.length if textures.length
    normals.splice max*3, normals.length if normals.length
    tangents.splice max*4, tangents.length if tangents.length
    bitangents.splice max*3, tangents.length if tangents.length
    
    newMesh = new (this.__proto__.constructor)
      init: (v, c, t, n, i) ->
        (v.push __v for __v in _v)
        (c.push __c for __c in _c) if _c
        (t.push __t for __t in _t) if _t
        (n.push __n for __n in _n) if _n
        (a.push __a for __a in _a) if _a
        (b.push __b for __b in _b) if _b
        (i.push __i for __i in _i)
