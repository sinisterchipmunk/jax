class Jax.Material.Layer.LightAmbient extends Jax.Material.IlluminationLayer
  constructor: (options) ->
    # refers to the material's ambient component, so
    # default full white just means use world ambient
    @color = Jax.Color.parse '#ffff'
    @intensity = 1
    super options
  
  illuminate: (context, mesh, model, vars, light) ->
    vars.MaterialAmbientIntensity = @intensity
    vars.LightAmbientColor = light.color.ambient
    vars.MaterialAmbientColor = @color
    