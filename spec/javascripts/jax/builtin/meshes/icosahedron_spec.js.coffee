
###
Costly high level accessor

@return {Array} of 3D vectors
###
Jax.Mesh.Base.prototype.getVerticesAsVectors = () ->
  [vertices, vector] = [[], []]
  i = 0

  for coordinate in @data.vertexWrapper.buffer # or maybe @data.vertexBuffer ?

    vector.push coordinate
    i++

    if i > 2
      vertices.push(vec3.create vector)
      vector.length = i = 0

  vertices


###
Costly high level accessor
Should be rewritten without using @getVerticesAsVectors (perfs!)

@return {Array} of Jax.Geometry.Triangle
###
Jax.Mesh.Triangles.prototype.getFacesAsTriangles = () ->
  [faces, face ] = [[], []]
  vertices = @getVerticesAsVectors()
  i = 0

  for vertice in vertices

    face.push vertice
    i++

    if i > 2
      faces.push(new Jax.Geometry.Triangle(face[0], face[1], face[2]))
      face.length = i = 0

  faces


###
Is this triangle equilateral ?
Equilateral :
  - its sides are of the same length
  - its vertices are at the same distance of the center

Maybe this should not rely on the center being computed ?

@return {Boolean}
###
Jax.Geometry.Triangle.prototype.isEquilateral = () ->
  distA = vec3.dist @center, @a
  distB = vec3.dist @center, @b
  distC = vec3.dist @center, @c

  Math.equalish(distA, distB) && Math.equalish(distB, distC)


###
Returns an array containing the elements of iterable,
but without any duplicates
Todo: make results of the same type as iterable

@param {Array|Object} iterable
@return {Array}
###
unique = (iterable) ->
  results = []

  contains = (haystack, needle) ->
    for straw in haystack
      match = true
      for value, key in needle
        match = false unless straw[key] == value
      return true if match
    false

  for item in iterable
    results.push(item) unless contains(results, item)

  results


###################################

describe "Jax.Mesh.Icosahedron", ->
  icosa = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    icosa = new Jax.Mesh.Icosahedron()

  it "should build successfully", ->
    icosa.init verts, colors, texes, norms
    expect(verts.length).toBeGreaterThan(0)

  it "should rebuild successfully", ->
    for i in [0..10] # why 10 times specifically ?
      icosa.rebuild()
      expect(icosa.data.vertexBuffer.length).toBeGreaterThan(0)

  it "should render successfully", ->
    icosa.render SPEC_CONTEXT # or @context ?


  describe "its faces", ->

    faces = null

    beforeEach ->
      faces = icosa.getFacesAsTriangles()

    it "should be 20", ->
      expect(faces.length).toBe(20)

    it "should be equilateral triangles", ->
      for triangle in faces
        expect(triangle.isEquilateral()).toBeTrue()

    it "should organize in centrally symmetric pairs", ->
      dest = vec3.create()
      zero = vec3.create()
      for t1 in faces
        found = false
        for t2 in faces
          vec3.add t1.center, t2.center, dest
          if vec3.equal dest, zero
            found = true
            break
        expect(found).toBeTrue()


  describe "its vertices", ->

    vertices = uniqueVertices = null;

    beforeEach ->
      vertices = icosa.getVerticesAsVectors()
      uniqueVertices = unique vertices

    it "should be 60 overall (20 faces, 3 vertices each)", ->
      expect(vertices.length).toBe(60)

    it "should regroup in 12 unique vertices", ->
      expect(uniqueVertices.length).toBe(12)

    it "should all have the size of the icosahedron as length", ->
      for v in vertices
        expect(vec3.length(v)).toBeCloseTo(icosa.size)

    it "should organize in diametrally opposite pairs", ->
      dest = vec3.create()
      zero = vec3.create()
      for v1 in uniqueVertices
        found = false
        for v2 in uniqueVertices
          vec3.add v1, v2, dest
          if vec3.equal dest, zero
            found = true
            break
        expect(found).toBeTrue()


  describe "its colors", ->

    it "should default to white", ->
      for ofs in [0...icosa.data.colorBuffer.length] by 4
        expect(icosa.data.colorBuffer[ofs+0]).toEqual 1
        expect(icosa.data.colorBuffer[ofs+1]).toEqual 1
        expect(icosa.data.colorBuffer[ofs+2]).toEqual 1
        expect(icosa.data.colorBuffer[ofs+3]).toEqual 1