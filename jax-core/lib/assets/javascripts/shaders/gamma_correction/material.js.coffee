#= require_tree .

class Jax.Material.Layer.GammaCorrection extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/gamma_correction/common']
    vertex:   Jax.shaderTemplates['shaders/gamma_correction/vertex']
    fragment: Jax.shaderTemplates['shaders/gamma_correction/fragment']

  constructor: (options) ->
    super options
    
  setVariables: (context, mesh, model, vars, pass) ->
    if @gamma is undefined
      vars.GammaCorrectionFactor = 1.0 / 2.2
    else if isNaN @gamma
      vars.GammaCorrectionFactor = 0.0 # sRGB
    else
      vars.GammaCorrectionFactor = 1.0 / @gamma
