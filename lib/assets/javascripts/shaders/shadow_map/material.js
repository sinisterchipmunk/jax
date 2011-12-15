Jax.Material.ShadowMap = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"shadow_map"});
  },
  
  setVariables: function(context, mesh, options, vars) {
    var light = context.world.lighting.getLight();
    var shadowmap_enabled = light.isShadowMapEnabled();
    
    vars.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR: 500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
          
      SHADOWMAP_PCF_ENABLED: false,
      SHADOWMAP_ENABLED: shadowmap_enabled
    });
    
    if (shadowmap_enabled) {
      vars.set({SHADOWMAP_MATRIX: light.getShadowMatrix()});
      var front, back;

      front = light.getShadowMapTextures(context)[0];
      back  = light.getShadowMapTextures(context)[1];

      if (front) vars.texture('SHADOWMAP0', front, context);
      if (back)  vars.texture('SHADOWMAP1', back,  context);
    }
  }
});
