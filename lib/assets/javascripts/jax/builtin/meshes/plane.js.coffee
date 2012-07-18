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
    
  init: (verts, colors, texes, norms) ->
    # we don't calculate normals here so that Jax can auto calculate
    # them later, ensuring that they are correct for custom Y values
    
    plot = {}
    [w, d, xs, zs] = [@width, @depth, @xSegments, @zSegments]
    [xUnit, zUnit] = [w / xs, d / zs]
    
    for x in [1...xs] by 2
      for z in [0...zs]
        vx = xUnit * x - w / 2
        vz = zUnit * z - d / 2
        vy1 = plot["#{x};#{z}"] or= @fn x, z
        vy2 = plot["#{x-1};#{z}"] or= @fn x - 1, z
        verts.push vx, vz, vy1
        verts.push vx - xUnit, vz, vy2
        texes.push x / (xs-1), z / (zs-1)
        texes.push (x-1) / (xs-1), z / (zs-1)
      
      x++
      for z in [(zs-1)..0]
        vx = xUnit * x - w / 2
        vz = zUnit * z - d / 2
        vy1 = plot["#{x};#{z}"] or= @fn x, z
        vy2 = plot["#{x-1};#{z}"] or= @fn x - 1, z
        verts.push vx - xUnit, vz, vy2
        verts.push vx, vz, vy1
        texes.push (x-1) / (xs-1), z / (zs-1)
        texes.push x / (xs-1), z / (zs-1)
