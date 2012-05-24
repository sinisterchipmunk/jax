class Jax.Material.Position extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars) ->
    stack = context.matrix_stack
    vars.set
      MVP: stack.getModelViewProjectionMatrix()
      VERTEX_POSITION: mesh.getVertexBuffer()
