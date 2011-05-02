Jax.shaders.setup = function(context, mesh, material, options, attributes, uniforms) {
  /*
    Run once per render sequence, this function is in charge of setting up the uniforms and
    attributes for the following render pass. If values are set for attributes or uniforms that
    don't exist, can't be found, or are disabled, then they are skipped.
   */
  
  var i;
  
  attributes.set('VERTEX_POSITION', mesh.getVertexBuffer());
  attributes.set('VERTEX_COLOR', mesh.getColorBuffer());
  attributes.set('VERTEX_NORMAL', mesh.getNormalBuffer());
  attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());

  uniforms.set({
    mMatrix: context.getModelMatrix(),
    vnMatrix: mat3.transpose(mat4.toMat3(context.getViewMatrix())),
    ivMatrix: context.getInverseViewMatrix(),
    vMatrix: context.getViewMatrix(),
    mvMatrix: context.getModelViewMatrix(),
    pMatrix: context.getProjectionMatrix(),
    nMatrix: context.getNormalMatrix(),

    materialAmbient: material.ambient,
    materialDiffuse: material.diffuse,
    materialSpecular: material.specular,
    materialShininess: material.shininess,

    PASS_TYPE: context.current_pass,
    
    LIGHT_ENABLED: context.world.lighting.getLight().isEnabled(),
    LIGHT_DIRECTION: context.world.lighting.getDirection(),
    LIGHT_POSITION:  context.world.lighting.getPosition(),
    LIGHT_TYPE: context.world.lighting.getType(),
    LIGHT_SPECULAR:context.world.lighting.getSpecularColor(),
    LIGHT_AMBIENT: context.world.lighting.getAmbientColor(),
    LIGHT_DIFFUSE: context.world.lighting.getDiffuseColor(),
    SPOTLIGHT_COS_CUTOFF: context.world.lighting.getSpotCosCutoff(),
    SPOTLIGHT_EXPONENT: context.world.lighting.getSpotExponent(),
    LIGHT_ATTENUATION_CONSTANT: context.world.lighting.getConstantAttenuation(),
    LIGHT_ATTENUATION_LINEAR: context.world.lighting.getLinearAttenuation(),
    LIGHT_ATTENUATION_QUADRATIC: context.world.lighting.getQuadraticAttenuation(),
        
    DP_SHADOW_NEAR: 0.1,//c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
    DP_SHADOW_FAR: 500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
    DP_DIRECTION: options &&  options.direction || 1,
    
    
    SHADOWMAP_PCF_ENABLED: false,
    SHADOWMAP_MATRIX: context.world.lighting.getLight().getShadowMatrix(),
    SHADOWMAP_ENABLED: context.world.lighting.getLight().isShadowMapEnabled(),
    SHADOWMAP0: (function(){
      context.glActiveTexture(GL_TEXTURE0);

      if (context.world.lighting.getLight().getType() == Jax.POINT_LIGHT) {
        context.glBindTexture(GL_TEXTURE_2D, context.world.lighting.getLight().getShadowMapTextures(context)[0]);
      } else {
        context.glBindTexture(GL_TEXTURE_2D, context.world.lighting.getLight().getShadowMapTexture(context));
      }
      return 0;
    })(),
    SHADOWMAP1: (function(){
      context.glActiveTexture(GL_TEXTURE1);

      if (context.world.lighting.getLight().getType() == Jax.POINT_LIGHT) {
        context.glBindTexture(GL_TEXTURE_2D, context.world.lighting.getLight().getShadowMapTextures(context)[1]);
      } else {
        context.glBindTexture(GL_TEXTURE_2D, context.world.lighting.getLight().getShadowMapTexture(context));
      }
      return 1;
    })()
  });
};
