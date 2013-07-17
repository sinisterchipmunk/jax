#= require 'jax/builtin/meshes/geometry_helper'

describe "Jax.Mesh.GeodesicSphere", ->

  geode = null
  vertices = colors = textureCoords = vertexNormals = null

  beforeEach ->
    [vertices, colors, textureCoords, vertexNormals] = [[], [], [], []]


  for subdivisions in [0..1] by 1

    describe "With "+subdivisions+" subdivision(s)", ->

      _subdivisions = subdivisions

      beforeEach ->
        geode = new Jax.Mesh.GeodesicSphere({subdivisions: _subdivisions})

      it "should build successfully", ->
        geode.init vertices, colors, textureCoords, vertexNormals
        expect(vertices.length).toBeGreaterThan(0)

      it "should rebuild successfully", ->
        for i in [0..10] by 1 # why 10 times specifically ?
          geode.rebuild()
          expect(geode.data.vertexBuffer.length).toBeGreaterThan(0)

      it "should render successfully", ->
        geode.render SPEC_CONTEXT # or @context ?


      describe "its faces", ->

        faces = null
        expectedFacesLength = 20 * Math.pow(4,_subdivisions)

        beforeEach ->
          faces = geode.getFacesAsTriangles()

        it "should be "+(expectedFacesLength), ->
          expect(faces.length).toBe(expectedFacesLength) # tautologging ^-^

        it "should organize in centrally symmetric pairs", ->
          dest = vec3.create()
          zero = vec3.create()
          for t1 in faces
            found = false
            for t2 in faces
              vec3.add dest, t1.center, t2.center
              if vec3.distance(dest, zero) < Math.EPSILON
                found = true
                break
            expect(found).toBeTrue()


      describe "its vertices", ->

        vertices = uniqueVertices = null
        expectedVerticesLength = 20 * 3 * Math.pow(4,_subdivisions)

        beforeEach ->
          vertices = geode.getVerticesAsVectors()
          uniqueVertices = Jax.Util.trimDuplicates vertices

        it "should be "+expectedVerticesLength+" overall", ->
          expect(vertices.length).toBe(expectedVerticesLength)

        it "should regroup in "+(2 + expectedVerticesLength / 6)+" unique vertices", ->
          # 12 vertices will touch 5 faces, the rest 6
          expect(uniqueVertices.length).toBe(2 + expectedVerticesLength / 6)

        it "should all have the size of the geode as length", ->
          for v in vertices
            expect(vec3.length(v)).toBeCloseTo(geode.size)

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
