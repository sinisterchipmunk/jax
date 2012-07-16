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
  
Examples:

    new Jax.Mesh.Plane()
    new Jax.Mesh.Plane size: 2
    new Jax.Mesh.Plane size: 2, segments: 10
    new Jax.Mesh.Plane width: 2, xSegments: 2
    
###
class Jax.Mesh.Plane extends Jax.Mesh.TriangleStrip
  constructor: (options) ->
    @size = options?.size || 500
    @segments = options?.segments || 20
    @width = @depth = @size
    @xSegments = @zSegments = @segments
    super options
    
  init: (verts, colors, texes, norms) ->
    [w, d, xs, zs] = [@width, @depth, @xSegments, @zSegments]
    [xUnit, zUnit] = [w / xs, d / zs]
    
    for x in [1...xs]
      for z in [0...zs]
        vx = xUnit * x - w / 2
        vz = zUnit * z - d / 2
        verts.push vx, vz, 0
        verts.push vx - xUnit, vz, 0
        norms.push 0, 0, -1, 0, 0, -1
        texes.push x / (xs-1), z / (zs-1)
        texes.push (x-1) / (xs-1), z / (zs-1)
        
      for z in [(zs-1)..0]
        vx = xUnit * x - w / 2
        vz = zUnit * z - d / 2
        verts.push vx-xUnit, vz, 0
        verts.push vx, vz, 0
        norms.push 0, 0, -1, 0, 0, -1
        texes.push (x-1) / (xs-1), z / (zs-1)
        texes.push x / (xs-1), z / (zs-1)
