class Jax.Mesh.OBJ.Parser
  constructor: (content) ->
    @objects = {}
    @vertices = []
    @textureCoords = []
    @normals = []
    curObj = null
    lines = []
    for line in content.split /\n/
      line = line.replace(/\#.*/, '').trim()
      if line
        args = line.split /\s+/
        switch cmd = args.shift()
          when 'o'  then curObj = @objects[args.shift()] =
            vertices: @vertices
            textureCoords: @textureCoords
            normals: @normals
            faces: []
            aggregates: {}
            smooth: false
          when 'v'  then @addVertex      curObj, args...
          when 'vt' then @addTexCoords   curObj, args...
          when 'vn' then @addNormal      curObj, args...
          when 'f'  then @addFace        curObj, args...
          when 's'  then @setSmoothFaces curObj, args...
          else console.warn 'OBJ: command not understood:', cmd, args
    @finalizeAggregates()

  setSmoothFaces: (obj, b) ->
    switch b
      when '1', 'on', 'true' then obj.smooth = true
      else obj.smooth = false

  finalizeAggregates: ->
    for name, obj of @objects
      if obj.aggregates
        for vi, set of obj.aggregates
          normal = [0, 0, 0]
          for n in set
            vec3.add normal, normal, n
          if vec3.length normal
            vec3.normalize normal, normal
          else
            normal[1] = 1
          set.splice 0, set.length
          set.push normal...
    true

  aggregate: (obj, face, vi, ni) ->
    if obj.smooth
      obj.aggregates[vi] or= []
      obj.aggregates[vi].push obj.normals[ni-1]
      obj.aggregates[vi]
    else
      obj.normals[ni-1]

  parseFace: (obj, v1, v2, v3) ->
    face =
      v: []
      t: []
      n: []
    for v in [v1, v2, v3]
      [vi, ti, ni] = [v.split(/\//)...]
      face.v.push obj.vertices[vi-1]
      face.t.push obj.textureCoords[ti-1]
      face.n.push @aggregate obj, face, vi, ni
    face

  addFace: (obj, v1, v2, v3, v4 = null) ->
    obj.faces.push @parseFace obj, v1, v2, v3
    if v4 isnt null
      obj.faces.push @parseFace obj, v1, v3, v4

  addVertex: (obj, x, y, z, w = 1) ->
    # w is unused in Jax at this time
    obj.vertices.push [ parseFloat(x), parseFloat(y), parseFloat(z) ]

  addTexCoords: (obj, u, v, w = 0) ->
    # w is unused in Jax at this time
    obj.textureCoords.push [ parseFloat(u), parseFloat(v) ]

  addNormal: (obj, x, y, z) ->
    normal = [ parseFloat(x), parseFloat(y), parseFloat(z) ]
    vec3.normalize normal, normal
    obj.normals.push normal
