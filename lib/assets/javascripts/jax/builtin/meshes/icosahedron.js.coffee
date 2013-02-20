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

  # UVs for each base face, matching http://upload.wikimedia.org/wikipedia/commons/d/dd/Icosahedron_flat.svg
  u = 2/11
  v = 1/3

  icosahedron = [
    vertices = [
      [ -1,  g,  0 ], [  1,  g,  0 ], [ -1, -g,  0 ], [  1, -g,  0 ],
      [  0, -1,  g ], [  0,  1,  g ], [  0, -1, -g ], [  0,  1, -g ],
      [  g,  0, -1 ], [  g,  0,  1 ], [ -g,  0, -1 ], [ -g,  0,  1 ]
    ],
    texes = [
      # the "default" uv mapping may have different uv values for the same vertex,
      # depending on the face, see http://upload.wikimedia.org/wikipedia/commons/d/dd/Icosahedron_flat.svg
      # How do I do that with the current texes implementation ?
    ],
    faces = [ # storing vertices' ids
      [  0, 11,  5 ], [  0,  5,  1 ], [  0,  1,  7 ], [  7,  1,  8 ],
      [  8,  6,  7 ], [ 10,  7,  6 ], [  0,  7, 10 ], [  0, 10, 11 ],
      [ 11, 10,  2 ], [  6,  2, 10 ], [  3,  2,  6 ], [  3,  6,  8 ],
      [  3,  8,  9 ], [  3,  9,  4 ], [  3,  4,  2 ], [  2,  4, 11 ],
      [  5, 11,  4 ], [  4,  9,  5 ], [  1,  5,  9 ], [  9,  8,  1 ]
    ],
    texesForFaces = [
#       [[u,v],[u/2, 0],[0,v]]
#      ,[[u,v],[0,v],[u/2,2*v]]
#      ,[[u,v],[u/2,2*v],[3*u/2,2*v]]
#      ,[[3*u/2,2*v],[u/2,2*v],[u,3*v]]
#
#      ,[[2*u,3*v],[5*u/2,2*v],[3*u/2,2*v]]
#      ,[[2*u,v],[3*u/2,2*v],[5*u/2,2*v]]
#      ,[[u,v],[3*u/2,2*v],[2*u,v]]
#      ,[[u,v],[2*u,v],[3*u/2,0]]
#
#      ,[[5*u/2],[2*u,v],[3*u,v]]
#      ,[[5*u/2,2*v],[3*u,v],[2*u,v]]
#      ,[[7*u/2,2*v],[3*u,v],[5*u/2,2*v]]
#      ,[[7*u/2,2*v],[5*u/2,2*v],[3*u,3*v]]
#
#      ,[[7*u/2,2*v],[4*u,3*v],[9*u/2,2*v]]
#      ,[[7*u/2,2*v],[9*u/2,2*v],[4*u, v]]
#      ,[[7*u/2,2*v],[4*u, v],[3*u,v]]
#      ,[[3*u,v],[4*u, v],[7*u/2,0]]
#
#      ,[[5*u,v],[9*u/2,0],[4*u,v]]
#      ,[[4*u,v],[9*u/2,2*v],[5*u,v]]
#      ,[[11*u/2,2*v],[5*u,v],[9*u/2,2*v]]
#      ,[[9*u/2,2*v],[5*u,3*v],[11*u/2,2*v]]
    ]
  ]

  constructor: (options = {}) ->
    @size = 1
    super options

  init: (verts, colors, texes, norms, indices) ->

    scale = @size / ( Math.sqrt( ( 5 + Math.sqrt(5) ) / 2 ) ) # normalize vertices

    for v in icosahedron.vertices
      for vCoord in v
        verts.push vCoord * scale

    # fixme
#    norms.push v for v in icosahedron.normals
#    texes.push v for v in icosahedron.textureCoords
#    indices.push v for v in icosahedron.indices

    true # don't return an array, it's faster