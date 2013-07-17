###
A Geodesic Sphere mesh, which is the fractalization of an icosahedron

Options:

* size : the size of the geode in units. Defaults to 1.0.
* subdivisions : the number of times each face is divided into 4 triangles. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphere
    new Jax.Mesh.GeodesicSphere size: 2, subdivisions: 1
###
class Jax.Mesh.GeodesicSphere extends Jax.Mesh.Triangles

  g = ( 1 + Math.sqrt( 5 ) ) / 2 # golden ratio ~= 1.61803398875

  # This is the resource @icosahedron => move to resource ? Used by child classes too !
  icosahedron: {
    vertices : [
      [ -1,  g,  0 ], [  1,  g,  0 ], [ -1, -g,  0 ], [  1, -g,  0 ],
      [  0, -1,  g ], [  0,  1,  g ], [  0, -1, -g ], [  0,  1, -g ],
      [  g,  0, -1 ], [  g,  0,  1 ], [ -g,  0, -1 ], [ -g,  0,  1 ],
    ],
    # faces are sorted by (arbitrary) adjacency, should be redone having the 20 and 1 adjacent too, i think it's possible
    faces : [ # storing vertices' indexes
      [  0, 11,  5 ], [  0,  5,  1 ], [  0,  1,  7 ], [  7,  1,  8 ],
      [  8,  6,  7 ], [ 10,  7,  6 ], [  0,  7, 10 ], [  0, 10, 11 ],
      [ 11, 10,  2 ], [  6,  2, 10 ], [  3,  2,  6 ], [  3,  6,  8 ],
      [  3,  8,  9 ], [  3,  9,  4 ], [  3,  4,  2 ], [  2,  4, 11 ],
      [  5, 11,  4 ], [  4,  9,  5 ], [  1,  5,  9 ], [  9,  8,  1 ],
    ],
    # UVs for each base face, matching http://upload.wikimedia.org/wikipedia/commons/d/dd/Icosahedron_flat.svg
    # This net subdivides neatly, but I'd like to provide some form of resource file so it can be easily overwritten
    uvU : 2/11,
    uvV : 1/3,
    facesUVs : [
      [ [   1,   1 ], [ 1/2,   0 ], [   0,   1 ] ],
      [ [   1,   1 ], [   0,   1 ], [ 1/2,   2 ] ],
      [ [   1,   1 ], [ 1/2,   2 ], [ 3/2,   2 ] ],
      [ [ 3/2,   2 ], [ 1/2,   2 ], [   1,   3 ] ],

      [ [   2,   3 ], [ 5/2,   2 ], [ 3/2,   2 ] ],
      [ [   2,   1 ], [ 3/2,   2 ], [ 5/2,   2 ] ],
      [ [   1,   1 ], [ 3/2,   2 ], [   2,   1 ] ],
      [ [   1,   1 ], [   2,   1 ], [ 3/2,   0 ] ],

      [ [ 5/2,   0 ], [   2,   1 ], [   3,   1 ] ],
      [ [ 5/2,   2 ], [   3,   1 ], [   2,   1 ] ],
      [ [ 7/2,   2 ], [   3,   1 ], [ 5/2,   2 ] ],
      [ [ 7/2,   2 ], [ 5/2,   2 ], [   3,   3 ] ],

      [ [ 7/2,   2 ], [   4,   3 ], [ 9/2,   2 ] ],
      [ [ 7/2,   2 ], [ 9/2,   2 ], [   4,   1 ] ],
      [ [ 7/2,   2 ], [   4,   1 ], [   3,   1 ] ],
      [ [   3,   1 ], [   4,   1 ], [ 7/2,   0 ] ],

      [ [   5,   1 ], [ 9/2,   0 ], [   4,   1 ] ],
      [ [   4,   1 ], [ 9/2,   2 ], [   5,   1 ] ],
      [ [11/2,   2 ], [   5,   1 ], [ 9/2,   2 ] ],
      [ [ 9/2,   2 ], [   5,   3 ], [11/2,   2 ] ],
    ]
  }

  constructor: (options = {}) ->
    @size = 1
    @subdivisions = 0
    if options.subdivisions > 5 then console.warn "Geode subdivided > 5 times is NOT supported ATM. Use at your own risk !"
    if options.icosahedron then options.icosahedron = Jax.Util.merge(options.icosahedron, @icosahedron)
    super options

  init: (vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) ->

    size = @size

    # Benchmarking
    # Jasmine + git checkout => benchmark branches using any spec file
    # tests :
    # icosahedron = @icosahedron

    # Helpers

    _vA = vec3.create() ; _vB = vec3.create() ; _vC = vec3.create()
    # Push to vertices and normals or subdivide into 4 new triangles
    recursiveInit = (vA, vB, vC, detail) ->
      if detail < 1
        vec3.normalize(_vA, vA)
        vec3.normalize(_vB, vB)
        vec3.normalize(_vC, vC)
        vertexNormals.push _vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]
        vec3.scale _vA, _vA, size
        vec3.scale _vB, _vB, size
        vec3.scale _vC, _vC, size
        vertices.push _vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]
      else
        detail--
        midAB = vec3.create();
        midBC = vec3.create();
        midCA = vec3.create();
        vec3.scale(midAB, vec3.add(midAB, vA, vB), 1/2 )
        vec3.scale(midBC, vec3.add(midBC, vB, vC), 1/2 )
        vec3.scale(midCA, vec3.add(midCA, vC, vA), 1/2 )

        recursiveInit vA, midAB, midCA, detail # top
        recursiveInit midAB, vB, midBC, detail # left
        recursiveInit midCA, midBC, vC, detail # right
        recursiveInit midAB, midBC, midCA, detail # center
      true


    u = @icosahedron.uvU ; v = @icosahedron.uvV
    # Push to UVs or subdivide into 4 new triangles
    recursiveInitUV = (uvA, uvB, uvC, detail) ->
      if detail < 1
        textureCoords.push uvA[0] * u, uvA[1] * v, uvB[0] * u, uvB[1] * v, uvC[0] * u, uvC[1] * v
      else
        detail--
        midAB = vec3.create();
        midBC = vec3.create();
        midCA = vec3.create();
        vec3.scale(midAB, vec3.add(midAB, uvA, uvB), 1/2 )
        vec3.scale(midBC, vec3.add(midBC, uvB, uvC), 1/2 )
        vec3.scale(midCA, vec3.add(midCA, uvC, uvA), 1/2 )

        recursiveInitUV uvA, midAB, midCA, detail # top
        recursiveInitUV midAB, uvB, midBC, detail # left
        recursiveInitUV midCA, midBC, uvC, detail # right
        recursiveInitUV midAB, midBC, midCA, detail # center
      true


    # Vertices & Vertices' Normals
    for face in @icosahedron.faces
      recursiveInit(
        vec3.clone(@icosahedron.vertices[face[0]]),
        vec3.clone(@icosahedron.vertices[face[1]]),
        vec3.clone(@icosahedron.vertices[face[2]]),
        @subdivisions
      )

    # UVs
    for faceUVs in @icosahedron.facesUVs
      recursiveInitUV(
        vec2.clone(faceUVs[0]),
        vec2.clone(faceUVs[1]),
        vec2.clone(faceUVs[2]),
        @subdivisions
      )

    # VertexIndices, Tangents & Bitangents are lazy-computed

    true # don't return an array, it's faster