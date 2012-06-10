class Jax.Material.Position extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshMap = vertices: 'VERTEX_POSITION'
    
  setVariables: (context, mesh, model, vars) ->
    mesh.data.set vars, @meshMap
    vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix()
