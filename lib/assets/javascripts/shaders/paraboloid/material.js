Jax.Material.Paraboloid = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    $super(Jax.Util.normalizeOptions(options, {shader:"paraboloid"}));
  },
  
  setVariables: function(context, mesh, options, vars) {
    vars.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR:  500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
      DP_DIRECTION: options && options.direction || 1
    });
  }
});
