Jax.Material.Paraboloid = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = options || {};
    options.shader = options.shader || "paraboloid";
    $super(options);
  },
  
  setVariables: function(context, mesh, model, vars) {
    vars.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR:  500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
      DP_DIRECTION: model && model.direction || 1
    });
  }
});
