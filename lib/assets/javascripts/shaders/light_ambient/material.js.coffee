class Jax.Material.LightAmbient extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    return unless pass
    
    light = context.world.lights[pass-1]
    vars.MaterialAmbientIntensity = @material.intensity.ambient
    vars.LightAmbientColor = light.color.ambient
