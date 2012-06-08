class Jax.Mesh.TriangleStrip extends Jax.Mesh.Base
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLE_STRIP
    super args...
