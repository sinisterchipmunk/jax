#= require jax/material/custom

class Jax.Material.ParaboloidDepthmap extends Jax.Material.Custom
  $ -> Jax.Material.ParaboloidDepthmap.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/main/paraboloid_depthmap/common']
    vertex:   Jax.shaderTemplates['shaders/main/paraboloid_depthmap/vertex']
    fragment: Jax.shaderTemplates['shaders/main/paraboloid_depthmap/fragment']

  defaultAttributes: -> $.extend super(),
    direction: -1
    near: 0.01
    far: 200

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.listen mesh.data, 'change', ->
      mesh.data.set binding, vertices: 'VertexPosition'
    binding.listen model.camera, 'change', @matricesChanged
    binding.listen context.world.cameras[0], 'change', @matricesChanged
    binding.listen this, 'change:direction', =>
      binding.set 'Direction', @get 'direction'
    binding.listen this, 'change:near', =>
      binding.set 'Near', @get 'near'
    binding.listen this, 'change:far', =>
      binding.set 'Far', @get 'far'

  matricesChanged: (binding) =>
    {context, model, mesh} = binding
    binding.set 'ModelViewMatrix', context.matrix_stack.getModelViewMatrix()
