class Jax.Material.GammaCorrection extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @varMap = {}
    
  setVariables: (context, mesh, model, vars, pass) ->
    if @material.gamma is undefined
      @varMap.GammaCorrectionFactor = 1.0 / 2.2
    else if isNaN @material.gamma
      @varMap.GammaCorrectionFactor = 0.0 # sRGB
    else
      @varMap.GammaCorrectionFactor = 1.0 / @material.gamma
    vars.set @varMap
