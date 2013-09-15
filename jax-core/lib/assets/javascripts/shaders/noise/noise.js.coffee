#= require_tree .

class Jax.Material.Layer.Noise extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/noise/common']
    vertex:   Jax.shaderTemplates['shaders/noise/vertex']
    fragment: Jax.shaderTemplates['shaders/noise/fragment']

  setVariables: (context, mesh, model, vars, pass) ->
    Jax.noise or= new Jax.Noise()
    vars.gradTexture = Jax.noise.grad
