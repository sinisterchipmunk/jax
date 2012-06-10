class Jax.Material.Attenuation extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @varMap = {}
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    return unless pass
    
    light = context.world.lights[pass-1]
    vars.ConstantAttenuation = light.attenuation.constant
    vars.LinearAttenuation = light.attenuation.linear
    vars.QuadraticAttenuation = light.attenuation.quadratic
