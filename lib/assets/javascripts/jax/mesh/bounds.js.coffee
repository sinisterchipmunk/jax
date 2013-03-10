class Jax.Mesh.Bounds
  constructor: ->
    @left   = GLMatrix.vec3.create()
    @right  = GLMatrix.vec3.create()
    @top    = GLMatrix.vec3.create()
    @bottom = GLMatrix.vec3.create()
    @front  = GLMatrix.vec3.create()
    @back   = GLMatrix.vec3.create()
    @center = GLMatrix.vec3.create()
    @width  = 0
    @height = 0
    @depth  = 0

