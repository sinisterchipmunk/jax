class Jax.Material.Layer.Position extends Jax.Material.Layer
  constructor: (options) ->
    super options
    @meshMap = vertices: 'VERTEX_POSITION'
    
  setVariables: (context, mesh, model, vars) ->
    mesh.data.set vars, @meshMap
    vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix()
