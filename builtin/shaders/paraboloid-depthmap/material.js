Jax.Material.DualParaboloid = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"paraboloid-depthmap"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR:  500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
      DP_DIRECTION: options && options.direction || 1
    });
  }
});
