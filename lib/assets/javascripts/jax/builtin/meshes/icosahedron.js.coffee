###
An Icosahedron mesh, which is a regular polyhedron with 20 equilateral triangles as sides

Options:

* size : the size of the icosahedron in units. Defaults to 1.0.

Example:

    new Jax.Mesh.Icosahedron
    new Jax.Mesh.Icosahedron size: 2
###
class Jax.Mesh.Icosahedron extends Jax.Mesh.GeodesicSphere

  constructor: (options = {}) ->
    options.subdivisions = 0
    super options