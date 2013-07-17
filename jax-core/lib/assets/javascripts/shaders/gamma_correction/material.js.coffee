class Jax.Material.Layer.GammaCorrection extends Jax.Material.Layer
  constructor: (options) ->
    super options
    
  setVariables: (context, mesh, model, vars, pass) ->
    if @gamma is undefined
      vars.GammaCorrectionFactor = 1.0 / 2.2
    else if isNaN @gamma
      vars.GammaCorrectionFactor = 0.0 # sRGB
    else
      vars.GammaCorrectionFactor = 1.0 / @gamma
