###
A Geodesic Sphere mesh, which is the fractalization of an icosahedron

Options:

* size : the size of the geode in units. Defaults to 1.0.
* complexity : the number of times each face is divided into 4 triangles. Defaults to 0.

@todo: think! name `complexity` differently ? detail ? level ? depth ? divisions ? subdivisions ?

Example:

    new Jax.Mesh.GeodesicSphere
    new Jax.Mesh.GeodesicSphere size: 2, complexity: 1
###
class Jax.Mesh.GeodesicSphere extends Jax.Mesh.Triangles

  g = ( 1 + Math.sqrt( 5 ) ) / 2 # golden ratio

  u = 2/11
  v = 1/3

  icosahedron = {
    vertices : [
      [ -1,  g,  0 ], [  1,  g,  0 ], [ -1, -g,  0 ], [  1, -g,  0 ],
      [  0, -1,  g ], [  0,  1,  g ], [  0, -1, -g ], [  0,  1, -g ],
      [  g,  0, -1 ], [  g,  0,  1 ], [ -g,  0, -1 ], [ -g,  0,  1 ],
    ],
    faces : [ # storing vertices' indexes
      [  0, 11,  5 ], [  0,  5,  1 ], [  0,  1,  7 ], [  7,  1,  8 ],
      [  8,  6,  7 ], [ 10,  7,  6 ], [  0,  7, 10 ], [  0, 10, 11 ],
      [ 11, 10,  2 ], [  6,  2, 10 ], [  3,  2,  6 ], [  3,  6,  8 ],
      [  3,  8,  9 ], [  3,  9,  4 ], [  3,  4,  2 ], [  2,  4, 11 ],
      [  5, 11,  4 ], [  4,  9,  5 ], [  1,  5,  9 ], [  9,  8,  1 ],
    ],
    # UVs for each base face, matching http://upload.wikimedia.org/wikipedia/commons/d/dd/Icosahedron_flat.svg
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
    @complexity = 0
    super options

  init: (vertices, colors, textureCoords, normals, vertexIndices, tangents, bitangents) ->

    size = @size

    _vA = vec3.create() ; _vB = vec3.create() ; _vC = vec3.create()
    recursiveInit = (vA, vB, vC, detail) ->
      if detail < 1
        vec3.normalize(vA, _vA)
        vec3.normalize(vB, _vB)
        vec3.normalize(vC, _vC)
        normals.push _vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]
        vec3.scale _vA, size
        vec3.scale _vB, size
        vec3.scale _vC, size
        vertices.push _vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]
      else
        detail--
        midAB = vec3.scale( vec3.add(vA, vB, vec3.create()), 1/2 )
        midBC = vec3.scale( vec3.add(vB, vC, vec3.create()), 1/2 )
        midCA = vec3.scale( vec3.add(vC, vA, vec3.create()), 1/2 )

        recursiveInit vA, midAB, midCA, detail # top
        recursiveInit midAB, vB, midBC, detail # left
        recursiveInit midCA, midBC, vC, detail # right
        recursiveInit midAB, midBC, midCA, detail # center
      true

    # Vertices & vertices' normals
    for face in icosahedron.faces
      recursiveInit(
        vec3.create(icosahedron.vertices[face[0]]),
        vec3.create(icosahedron.vertices[face[1]]),
        vec3.create(icosahedron.vertices[face[2]]),
        @complexity
      )

    recursiveInitUV = (uvA, uvB, uvC, detail) ->
      if detail < 1
        textureCoords.push uvA[0] * u, uvA[1] * v, uvB[0] * u, uvB[1] * v, uvC[0] * u, uvC[1] * v
      else
        detail--
        midAB = vec2.scale( vec2.add(uvA, uvB, vec2.create()), 1/2 )
        midBC = vec2.scale( vec2.add(uvB, uvC, vec2.create()), 1/2 )
        midCA = vec2.scale( vec2.add(uvC, uvA, vec2.create()), 1/2 )

        recursiveInitUV uvA, midAB, midCA, detail # top
        recursiveInitUV midAB, uvB, midBC, detail # left
        recursiveInitUV midCA, midBC, uvC, detail # right
        recursiveInitUV midAB, midBC, midCA, detail # center
      true

    # UVs
    for faceUVs in icosahedron.facesUVs
      recursiveInitUV vec2.create(faceUVs[0]), vec2.create(faceUVs[1]), vec2.create(faceUVs[2]), @complexity

    # Tangents todo
    # Bitangents todo

    true # don't return an array, it's faster