class Jax.Material.Layer.WorldAmbient extends Jax.Material.Layer
  constructor: (options) ->
    @intensity = 1
    super options
  
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    vars.WorldAmbientColor = context.world.ambientColor.toVec4()
    vars.MaterialAmbientIntensity = @intensity
