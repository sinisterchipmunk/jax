class Jax.Material.Attenuation extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @varMap = {}
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    return unless pass
    
    light = context.world.lights[pass-1]
    @varMap.PASS = pass
    @varMap.ConstantAttenuation = light.attenuation.constant
    @varMap.LinearAttenuation = light.attenuation.linear
    @varMap.QuadraticAttenuation = light.attenuation.quadratic
    
    vars.set @varMap
