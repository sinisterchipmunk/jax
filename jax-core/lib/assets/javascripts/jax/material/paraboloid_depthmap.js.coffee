#= require jax/material/custom

class Jax.Material.ParaboloidDepthmap extends Jax.Material.Custom
  ParaboloidDepthmap.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/main/paraboloid_depthmap/common']
    vertex:   Jax.shaderTemplates['shaders/main/paraboloid_depthmap/vertex']
    fragment: Jax.shaderTemplates['shaders/main/paraboloid_depthmap/fragment']

  defaultAttributes: -> $.extend super(),
    direction: -1
    near: 0.01
    far: 200

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.listen mesh, 'change:data', ->
      mesh.data.set binding, vertices: 'VertexPosition'
    binding.listen this, 'change:direction', =>
      binding.set 'Direction', @get 'direction'
    binding.listen this, 'change:near', =>
      binding.set 'Near', @get 'near'
    binding.listen this, 'change:far', =>
      binding.set 'Far', @get 'far'
    # NOTE: matrices have to be recalculated every pass because we can't know
    # what other matrices might be in the stack behind them at render time --
    # this issue is demonstrated by shadow maps where the light is in motion.
    binding.on 'prepare', @matricesChanged

  matricesChanged: (event) =>
    {binding} = event
    {context, model, mesh} = binding
    binding.set 'ModelViewMatrix', context.matrix_stack.getModelViewMatrix()
