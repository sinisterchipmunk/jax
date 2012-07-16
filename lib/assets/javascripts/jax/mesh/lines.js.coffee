class Jax.Mesh.Lines extends Jax.Mesh.Base
  constructor: (args...) ->
    @draw_mode or= GL_LINES
    super args...
