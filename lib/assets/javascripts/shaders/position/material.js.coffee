class Jax.Material.Position extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars) ->
    mesh.data.set vars, vertices: 'VERTEX_POSITION'
    vars.set 'ModelViewProjectionMatrix', context.matrix_stack.getModelViewProjectionMatrix()
