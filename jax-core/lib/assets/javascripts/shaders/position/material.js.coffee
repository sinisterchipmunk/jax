#= require_tree .

class Jax.Material.Layer.Position extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/position/common']
    vertex:   Jax.shaderTemplates['shaders/position/vertex']
    fragment: Jax.shaderTemplates['shaders/position/fragment']

  constructor: (options) ->
    super options
    @meshMap = vertices: 'VERTEX_POSITION'
    
  setVariables: (context, mesh, model, vars) ->
    mesh.data.set vars, @meshMap
    vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix()
