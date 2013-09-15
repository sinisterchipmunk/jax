#= require_tree .

class Jax.Material.Layer.Attenuation extends Jax.Material.Layer
  shaders:
    fragment: Jax.shaderTemplates['shaders/attenuation/fragment']

  constructor: (options) ->
    super options
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    return unless pass
    
    light = context.world.lights[pass-1]
    vars.ConstantAttenuation = light.attenuation.constant
    vars.LinearAttenuation = light.attenuation.linear
    vars.QuadraticAttenuation = light.attenuation.quadratic
    