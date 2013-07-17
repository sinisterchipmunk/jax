#= require 'jax/builtin/meshes/geometry_helper'

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
          if vec3.distance(dest, zero) < Math.EPSILON
            found = true
            break
        expect(found).toBeTrue()


  describe "its vertices", ->

    vertices = uniqueVertices = null;

    beforeEach ->
      vertices = icosa.getVerticesAsVectors()
      uniqueVertices = Jax.Util.trimDuplicates vertices

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
          if vec3.distance(dest, zero) < Math.EPSILON
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