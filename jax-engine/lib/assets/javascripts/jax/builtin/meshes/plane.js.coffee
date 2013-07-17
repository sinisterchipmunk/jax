###
Constructs a multi-polygonal flat plane treating the center of
the plane as the origin.

Options:

  * width: the width of the plane in units. Defaults to `size`.
  * depth: the depth of the plane in units. Defaults to `size`.
  * size: a value to use for any of the other dimensional options
          if they are unspecified. Defaults to 500.
  * xSegments: the number of vertices along the plane's X axis.
          Defaults to `segments`.
  * zSegments: the numebr of segments along the plane's Z axis.
          Defaults to `segments`.
  * segments: a value to use for any of the other segment count
  *       options if they are unspecified. Defaults to 20.
  * fn: a function accepting x and z coordinates, which is expected
          to return a Y coordinate. By default, Y is always 0, producing
          a flat plane.
  
Examples:

    new Jax.Mesh.Plane()
    new Jax.Mesh.Plane size: 2
    new Jax.Mesh.Plane size: 2, segments: 10
    new Jax.Mesh.Plane width: 2, xSegments: 2
    
###
class Jax.Mesh.Plane extends Jax.Mesh.TriangleStrip
  constructor: (options) ->
    @fn = (x, z) -> 0
    @size = options?.size || 500
    @segments = options?.segments || 20
    @width = @depth = @size
    @xSegments = @zSegments = @segments
    super options
    
  init: (verts, colors, texes, norms, indices) ->
    # we don't calculate normals here so that Jax can auto calculate
    # them later, ensuring that they are correct for custom Y values
    hashes = {}
    [w, d, xs, zs] = [@width, @depth, @xSegments, @zSegments]
    [xUnit, zUnit] = [w / xs, d / zs]

    hash = (x, z) =>
      key = "#{x};#{z}"
      if hashes[key] isnt undefined then return hashes[key]
      else
        vx = xUnit * x - w / 2
        vz = zUnit * z - d / 2
        vy = @fn x, z
        index = verts.length / 3
        verts.push vx, vz, vy
        texes.push x / (xs-1), z / (zs-1)
        hashes[key] = index

    for x in [1...xs] by 2
      for z in [0...zs]
        indices.push hash x    , z
        indices.push hash x - 1, z
      
      x++
      for z in [(zs-1)..0]
        indices.push hash x - 1, z
        indices.push hash x    , z

    true # don't return an array, it's faster this way
