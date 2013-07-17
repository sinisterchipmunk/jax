###
Costly high level vertices accessor

@return {Array} of 3D vectors
###
Jax.Mesh.Base::getVerticesAsVectors = () ->
  vertices = []
  data = @data.vertexBuffer

  for i in [0...data.length] by 3 # data.length is _ref'd by coffee
    vertices.push vec3.fromValues data[i], data[i+1], data[i+2]

  vertices


###
Costly high level faces accessor

@return {Array} of Jax.Geometry.Triangle
###
Jax.Mesh.Triangles::getFacesAsTriangles = () ->
  faces = []
  data = @data.vertexBuffer

  for i in [0...data.length] by 9
    faces.push(new Jax.Geometry.Triangle(
      [data[i+0],data[i+1],data[i+2]],
      [data[i+3],data[i+4],data[i+5]],
      [data[i+6],data[i+7],data[i+8]]
    ))

  faces


###
Is this triangle equilateral ?
Equilateral :
  - its sides are of the same length
  - its vertices are at the same distance of the center

@return {Boolean}
###
Jax.Geometry.Triangle::isEquilateral = () ->
  distA = vec3.distance @a, @b
  distB = vec3.distance @b, @c
  distC = vec3.distance @c, @a

  Math.equalish(distA, distB) && Math.equalish(distB, distC)
