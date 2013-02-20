###
An Icosahedron mesh, which is a regular polyhedron with 20 equilateral triangles as sides

¡ WORK IN PROGRESS !

Options:

* size : the size of the icosahedron in units. Defaults to 1.0.

Example:

    new Jax.Mesh.Icosahedron
    new Jax.Mesh.Icosahedron size: 2
###
class Jax.Mesh.Icosahedron extends Jax.Mesh.Triangles

  g = ( 1 + Math.sqrt( 5 ) ) / 2 # golden ratio


  u = 2/11
  v = 1/3

  icosahedron = [
    vertices = [
      [ -1,  g,  0 ], [  1,  g,  0 ], [ -1, -g,  0 ], [  1, -g,  0 ],
      [  0, -1,  g ], [  0,  1,  g ], [  0, -1, -g ], [  0,  1, -g ],
      [  g,  0, -1 ], [  g,  0,  1 ], [ -g,  0, -1 ], [ -g,  0,  1 ],
    ],
    faces = [ # storing vertices' ids
      [  0, 11,  5 ], [  0,  5,  1 ], [  0,  1,  7 ], [  7,  1,  8 ],
      [  8,  6,  7 ], [ 10,  7,  6 ], [  0,  7, 10 ], [  0, 10, 11 ],
      [ 11, 10,  2 ], [  6,  2, 10 ], [  3,  2,  6 ], [  3,  6,  8 ],
      [  3,  8,  9 ], [  3,  9,  4 ], [  3,  4,  2 ], [  2,  4, 11 ],
      [  5, 11,  4 ], [  4,  9,  5 ], [  1,  5,  9 ], [  9,  8,  1 ],
    ],
    # UVs for each base face, matching http://upload.wikimedia.org/wikipedia/commons/d/dd/Icosahedron_flat.svg
    facesUVs = [
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
  ]

  constructor: (options = {}) ->
    @size = 1
    super options

  init: (verts, colors, texes, norms, indices) ->

    scale = @size / ( Math.sqrt( ( 5 + Math.sqrt(5) ) / 2 ) ) # normalize vertices

    for face in icosahedron.faces
      for vIndex in face
        for vCoord in icosahedron.vertices[vIndex]
          verts.push scale * vCoord

    for faceUVs in icosahedron.facesUVs
      for uv in faceUVs
        texes.push uv[0] * u
        texes.push uv[1] * v

    # fixme
#    norms.push v for v in icosahedron.normals
#    indices.push v for v in icosahedron.indices

    true # don't return an array, it's faster