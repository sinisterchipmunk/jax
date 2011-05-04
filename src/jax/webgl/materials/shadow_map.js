Jax.Material.ShadowMap = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = texture;
    $super({shader:"shadow_map"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR: 500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
          
      SHADOWMAP_PCF_ENABLED: false,
      SHADOWMAP_MATRIX: context.world.lighting.getLight().getShadowMatrix(),
      SHADOWMAP_ENABLED: context.world.lighting.getLight().isShadowMapEnabled()
    });
    
    var light = context.world.lighting.getLight(), front, back;

    front = light.getShadowMapTextures(context)[0];
    back  = light.getShadowMapTextures(context)[1];
    
    if (front) uniforms.texture('SHADOWMAP0', front, context);
    if (back)  uniforms.texture('SHADOWMAP1', back,  context);
  }
});
