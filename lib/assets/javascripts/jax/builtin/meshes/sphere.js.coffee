###
  A spherical mesh.
  
  Takes 3 options:
      radius: the size of this sphere. Defaults to 0.5.
      slices: vertical resolution of the sphere. Defaults to 30.
      stacks: the horizontal resolution of the sphere. Defaults to 30.
      
  In general, you can get away with a lower number of slices and stacks
  for a smaller sphere, without losing too much visual fidelity. Larger
  or closer spheres will require more slices and stacks in order to
  present more spherical shapes.
  
  (Slices and stacks are equivalent to Blender's segments and rings,
  respectively.)
  
  Example:
  
      new Jax.Mesh.Sphere
        radius: 0.25
        slices: 8
        stacks: 8
        
###
class Jax.Mesh.Sphere extends Jax.Mesh.TriangleStrip
  constructor: (options) ->
    @slices = 30
    @stacks = 30
    @radius = 0.5
    super options
    
  init: (vertices, colors, textureCoords, normals, indices) ->
    [slices, stacks, radius] = [@slices, @stacks, @radius]
    slice = stack = 0
    for slice in [0..slices]
      theta = slice * Math.PI / slices
      sinth = Math.sin theta
      costh = Math.cos theta
      
      for stack in [0..stacks]
        phi = stack * 2 * Math.PI / stacks
        sinph = Math.sin phi
        cosph = Math.cos phi
        
        x = cosph * sinth
        y = costh
        z = sinph * sinth
        u = 1 - (stack / stacks)
        v = 1 - (slice / slices)
        
        normals.push x, y, z
        textureCoords.push u, v
        vertices.push radius * x, radius * y, radius * z
        
    for slice in [0..slices]
      for stack in [0...stacks]
        first = (slice * stacks) + stack
        second = first + stacks + 1
        indices.push second, first, first + 1
        indices.push first + 1, second, second + 1
