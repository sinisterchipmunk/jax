class Jax.Material.GammaCorrection extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    if @material.gamma is undefined
      vars.GammaCorrectionFactor = 1.0 / 2.2
    else if isNaN @material.gamma
      vars.GammaCorrectionFactor = 0.0 # sRGB
    else
      vars.GammaCorrectionFactor = 1.0 / @material.gamma
