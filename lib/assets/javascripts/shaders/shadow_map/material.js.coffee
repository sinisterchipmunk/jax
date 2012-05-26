class Jax.Material.ShadowMap extends Jax.Material.Layer
  constructor: (options, material) ->
    options or= {}
    options.shader or= "shadow_map"
    super options, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    light = context.world.lighting.getLight()
    shadowmap_enabled = light.isShadowMapEnabled()
    
    vars.set
      DP_SHADOW_NEAR: 0.1  # c.world.lighting.getLight().getDPShadowNear() || 0.1
      DP_SHADOW_FAR:  500  # c.world.lighting.getLight().getDPShadowFar()  || 500
      SHADOWMAP_PCF_ENABLED: false
      SHADOWMAP_ENABLED: shadowmap_enabled
      
    if shadowmap_enabled
      vars.set 'SHADOWMAP_MATRIX', light.getShadowMatrix()
      front = light.getShadowMapTextures(context)[0]
      back  = light.getShadowMapTextures(context)[1]
      if front then vars.set 'SHADOWMAP0', front
      if back  then vars.set 'SHADOWMAP1', back
