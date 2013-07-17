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
    for stack in [0..stacks]
      # note we iterate through slices, inclusive. Without this,
      # the last slice rendered will have texture coords in the
      # full range [0..1], resulting in ugly UV errors.
      for slice in [0..slices]
        theta = stack * Math.PI / stacks
        phi = slice * 2 * Math.PI / slices
        sinth = Math.sin theta
        sinph = Math.sin phi
        costh = Math.cos theta
        cosph = Math.cos phi
        x = cosph * sinth
        y = sinph * sinth
        z = costh
        u = 1 - (stack / stacks)
        v = 1 - (slice / slices)
        if (Math.equalish(x, 0)) then x = 0
        if (Math.equalish(y, 0)) then y = 0
        if (Math.equalish(z, 0)) then z = 0
        vertices.push x * radius, y * radius, z * radius
        normals.push x, y, z
        textureCoords.push u, v
    
    # Use slices+1 instead of just slices because of the above
    # UV issue.
    _slices = slices + 1
    for stack in [0...stacks]
      for slice in [0..slices]
        first = (stack * _slices) + (slice % _slices)
        second = ((stack + 1) * _slices) + (slice % _slices)
        indices.push first, second
