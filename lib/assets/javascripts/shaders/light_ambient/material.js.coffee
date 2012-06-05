class Jax.Material.LightAmbient extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @varMap = {}
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    return unless pass
    
    light = context.world.lights[pass-1]
    @varMap.PASS = pass
    @varMap.MaterialAmbientIntensity = @material.intensity.ambient
    @varMap.LightAmbientColor = light.color.ambient
    
    vars.set @varMap
