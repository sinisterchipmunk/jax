class Jax.Mesh.Bounds
  constructor: ->
    @left   = vec3.create()
    @right  = vec3.create()
    @top    = vec3.create()
    @bottom = vec3.create()
    @front  = vec3.create()
    @back   = vec3.create()
    @center = vec3.create()
    @width  = 0
    @height = 0
    @depth  = 0

