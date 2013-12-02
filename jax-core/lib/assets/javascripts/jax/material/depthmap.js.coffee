#= require jax/material/custom

class Jax.Material.Depthmap extends Jax.Material.Custom
  $ -> Jax.Material.Depthmap.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/main/depthmap/common']
    vertex:   Jax.shaderTemplates['shaders/main/depthmap/vertex']
    fragment: Jax.shaderTemplates['shaders/main/depthmap/fragment']

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.listen mesh.data, 'change', ->
      mesh.data.set binding, vertices: 'VertexPosition'
    binding.listen model.camera, 'change', @matricesChanged
    binding.listen context.world.cameras[0], 'change', @matricesChanged

  matricesChanged: (binding) =>
    {context, model, mesh} = binding
    binding.set 'ModelViewProjectionMatrix',
                context.matrix_stack.getModelViewProjectionMatrix()
