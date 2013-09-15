#= require_tree .

class Jax.Material.Layer.Depthmap extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/depthmap/common']
    vertex:   Jax.shaderTemplates['shaders/depthmap/vertex']
    fragment: Jax.shaderTemplates['shaders/depthmap/fragment']

  setVariables: (context, mesh, model, vars, pass) ->
    # Don't take depth maps of models not intended to create them
    return false unless model.castShadow
    