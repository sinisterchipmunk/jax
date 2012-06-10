class Jax.Material.ShadowMap extends Jax.Material.Layer
  constructor: (options, material) ->
    options or= {}
    options.shader or= "shadow_map"
    super options, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    return # Until lighting is ready to be used
    
    light = context.world.lighting.getLight()
    shadowmap_enabled = light.isShadowMapEnabled()
    
    vars.DP_SHADOW_NEAR = 0.1  # c.world.lighting.getLight().getDPShadowNear() || 0.1
    vars.DP_SHADOW_FAR =  500  # c.world.lighting.getLight().getDPShadowFar()  || 500
    vars.SHADOWMAP_PCF_ENABLED = false
    vars.SHADOWMAP_ENABLED = shadowmap_enabled
      
    if shadowmap_enabled
      vars.SHADOWMAP_MATRIX = light.getShadowMatrix()
      if front = light.getShadowMapTextures(context)[0] then vars.SHADOWMAP0 = front
      if back = light.getShadowMapTextures(context)[1]  then vars.SHADOWMAP1 = back
