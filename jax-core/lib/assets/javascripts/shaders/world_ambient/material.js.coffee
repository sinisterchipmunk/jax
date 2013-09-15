#= require_tree .

class Jax.Material.Layer.WorldAmbient extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/world_ambient/common']
    vertex:   Jax.shaderTemplates['shaders/world_ambient/vertex']
    fragment: Jax.shaderTemplates['shaders/world_ambient/fragment']

  constructor: (options) ->
    @intensity = 1
    # refers to the material's ambient component, so
    # default full white just means use world ambient
    @color = Jax.Color.parse '#ffff'
    super options
  
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    vars.WorldAmbientColor = context.world.ambientColor.toVec4()
    vars.MaterialAmbientColor = @color
    vars.MaterialAmbientIntensity = @intensity
