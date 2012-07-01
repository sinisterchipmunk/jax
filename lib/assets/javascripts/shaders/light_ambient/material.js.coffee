class Jax.Material.Layer.LightAmbient extends Jax.Material.IlluminationLayer
  illuminate: (context, mesh, model, vars, light) ->
    vars.MaterialAmbientIntensity = @intensity
    vars.LightAmbientColor = light.color.ambient
