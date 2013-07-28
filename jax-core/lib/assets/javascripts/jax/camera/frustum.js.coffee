#= require 'jax/geometry'

class Jax.Frustum extends Jax.Model
  @include Jax.EventEmitter
  
  [RIGHT, LEFT, BOTTOM, TOP, FAR, NEAR] = [0, 1, 2, 3, 4, 5]
  @OUTSIDE:   Jax.Geometry.Plane.BACK
  @INTERSECT: Jax.Geometry.Plane.INTERSECT
  @INSIDE:    Jax.Geometry.Plane.FRONT
  
  constructor: (@modelview, @projection) ->
    super()
    @planes = (new Jax.Geometry.Plane for i in [0...6])
    @invalidate()
    
  @getter 'mesh', ->
    return @_mesh if @_mesh
    mesh = @_mesh = new Jax.Mesh.Lines
      init: (vertices, colors) ->
        for i in [0...28]
          vertices.push 0, 0, 0
          colors.push 1, 1, 0, 1
    recalculateMeshVertices = =>
      vertices = mesh.data.vertexBuffer
      e = @extents()
      for i in [0..2]
        # near quad
        vertices[ 0+i] = e.ntl[i]; vertices[ 3+i] = e.ntr[i]
        vertices[ 6+i] = e.ntr[i]; vertices[ 9+i] = e.nbr[i]
        vertices[12+i] = e.ntr[i]; vertices[15+i] = e.nbr[i]
        vertices[18+i] = e.nbr[i]; vertices[21+i] = e.nbl[i]
        vertices[24+i] = e.nbl[i]; vertices[27+i] = e.ntl[i]
        # far quad
        vertices[30+i] = e.ftl[i]; vertices[33+i] = e.ftr[i]
        vertices[36+i] = e.ftr[i]; vertices[39+i] = e.fbr[i]
        vertices[42+i] = e.ftr[i]; vertices[45+i] = e.fbr[i]
        vertices[48+i] = e.fbr[i]; vertices[51+i] = e.fbl[i]
        vertices[54+i] = e.fbl[i]; vertices[57+i] = e.ftl[i]
        # left side
        vertices[60+i] = e.ntl[i]; vertices[63+i] = e.ftl[i]
        vertices[66+i] = e.nbl[i]; vertices[69+i] = e.fbl[i]
        # right side
        vertices[72+i] = e.ntr[i]; vertices[75+i] = e.ftr[i]
        vertices[78+i] = e.nbr[i]; vertices[81+i] = e.fbr[i]
      mesh.data.invalidate()
    @on 'updated', recalculateMeshVertices
    recalculateMeshVertices()
    return mesh
    
  testVec = vec3.create()
  point: (point, y, z) ->
    @validate()
    if y isnt undefined
      [testVec[0], testVec[1], testVec[2]] = [point, y, z]
      point = testVec
    for plane in @planes
      if plane.distance(point) < 0 then return Jax.Frustum.OUTSIDE
    return Jax.Frustum.INSIDE
    
  sphere: (center, radius, y, z) ->
    @validate()
    if y isnt undefined
      radius = z
      [testVec[0], testVec[1], testVec[2]] = [center, radius, y]
      center = testVec
    result = Jax.Frustum.INSIDE
    for plane in @planes
      distance = plane.distance center
      if distance < -radius then return Jax.Frustum.OUTSIDE
      if distance <  radius then result = Jax.Frustum.INTERSECT
    result
  
  cube: (position, w, h, d) ->
    @validate()
    c2 = 0
    [xp, xn] = [position[0] + w, position[0] - w]
    [yp, yn] = [position[1] + h, position[1] - h]
    [zp, zn] = [position[2] + d, position[2] - d]
    for plane in @planes
      c = 0
      if plane.classify(xp, yp, zp) > 0 then c++
      if plane.classify(xn, yp, zp) > 0 then c++
      if plane.classify(xp, yn, zp) > 0 then c++
      if plane.classify(xn, yn, zp) > 0 then c++
      if plane.classify(xp, yp, zn) > 0 then c++
      if plane.classify(xn, yp, zn) > 0 then c++
      if plane.classify(xp, yn, zn) > 0 then c++
      if plane.classify(xn, yn, zn) > 0 then c++
      if c is 0 then return Jax.Frustum.OUTSIDE
      if c is 8 then c2++
    if c2 is 6 then Jax.Frustum.INSIDE
    else Jax.Frustum.INTERSECT
    
  pointVisible:  (center, y, z)         -> @point(center, y, z)          isnt Jax.Frustum.OUTSIDE
  sphereVisible: (center, radius, y, z) -> @sphere(center, radius, y, z) isnt Jax.Frustum.OUTSIDE
  cubeVisible:   (position, w, h, d)    -> @cube(position, w, h, d)      isnt Jax.Frustum.OUTSIDE
    
  invalidate: ->
    @_isValid = false
    
  isValid: -> @_isValid
  
  validate: ->
    return if @isValid()
    @extractFrustum()
    @_isValid = true
    @trigger 'updated'
    
  extractedM = mat4.create()
  extractedVec = vec3.create()
  calcExtent: (vec, x, y, z) ->
    vec[0] = x
    vec[1] = y
    vec[2] = z
    vec[3] = 1
    vec4.transformMat4 vec, vec, extractedM
    if vec[3] is 0
      vec[0] = vec[1] = vec[2] = 0
      return vec
    vec[3] = 1 / vec[3]
    vec[0] = vec[0] * vec[3]
    vec[1] = vec[1] * vec[3]
    vec[2] = vec[2] * vec[3]
    return vec
  
  extents: ->
    return @_extractedExtents if @isValid()
    e = @_extractedExtents or=
      ntl: vec4.create(), ntr: vec4.create(), nbl: vec4.create(), nbr: vec4.create(),
      ftl: vec4.create(), ftr: vec4.create(), fbl: vec4.create(), fbr: vec4.create()
    m = extractedM
    mat4.multiply m, @projection, @modelview
    mat4.invert m, m
    @calcExtent e.ntl, -1,  1, -1; @calcExtent e.ntr,  1,  1, -1
    @calcExtent e.nbl, -1, -1, -1; @calcExtent e.nbr,  1, -1, -1
    @calcExtent e.ftl, -1,  1,  1; @calcExtent e.ftr,  1,  1,  1
    @calcExtent e.fbl, -1, -1,  1; @calcExtent e.fbr,  1, -1,  1
    @_extractedExtents
  
  extractFrustum: ->
    e = @extents()
    @planes[TOP].set    e.ntr, e.ntl, e.ftl
    @planes[BOTTOM].set e.nbl, e.nbr, e.fbr
    @planes[LEFT].set   e.ntl, e.nbl, e.fbl
    @planes[RIGHT].set  e.nbr, e.ntr, e.fbr
    @planes[NEAR].set   e.ntl, e.ntr, e.nbr
    @planes[FAR].set    e.ftr, e.ftl, e.fbl
    
  render: (context, material) ->
    @mesh.render context, this, material
