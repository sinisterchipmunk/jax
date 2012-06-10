class Jax.Material.WorldAmbient extends Jax.Material.Layer
  constructor: (options, material) ->
    @defaultIntensity = 1
    super options, material
  
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    vars.WorldAmbientColor = context.world.ambientColor.toVec4()
    vars.MaterialAmbientIntensity = @material.intensity?.ambient || @defaultIntensity
