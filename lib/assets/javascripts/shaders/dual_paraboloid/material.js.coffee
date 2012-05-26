class Jax.Material.DualParaboloid extends Jax.Material.Layer
  constructor: (options, material) ->
    options or= {}
    options.shader or= "dual_paraboloid"
    super options, material
  
  numPasses: -> 2
  
  setVariables: (context, mesh, model, vars, pass) ->
    vars.set
      DP_SHADOW_NEAR: 0.1 # c.world.lighting.getLight().getDPShadowNear() || 0.1
      DP_SHADOW_FAR:  500 # c.world.lighting.getLight().getDPShadowFar()  || 500
      DP_DIRECTION:   (if pass is 1 then -1 else 1)
  