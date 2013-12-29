#= require jax/material/custom

class Jax.Material.Picking extends Jax.Material.Custom
  Picking.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/main/picking/common']
    vertex:   Jax.shaderTemplates['shaders/main/picking/vertex']
    fragment: Jax.shaderTemplates['shaders/main/picking/fragment']

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.set 'guid', model.guid
    binding.listen mesh, 'change:data', ->
      mesh.data.set binding, vertices: 'VertexPosition'
    # NOTE: matrices have to be recalculated every pass because we can't know
    # what other matrices might be in the stack behind them at render time --
    # this issue is demonstrated by shadow maps where the light is in motion.
    binding.on 'prepare', @matricesChanged

  matricesChanged: (event) =>
    {binding} = event
    {context, model, mesh} = binding
    binding.set 'ModelViewProjectionMatrix',
                context.matrix_stack.getModelViewProjectionMatrix()
