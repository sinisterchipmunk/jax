Jax.shader_program_builders['blinn-phong'] = (function() {
  function defs(options) {
    return [
      /* matrix uniforms */
      'uniform mat4 mvMatrix, pMatrix;',
      'uniform mat3 nMatrix;',
      
      /* material uniforms */
      'uniform vec4 materialDiffuse, materialAmbient, materialSpecular;',
      'uniform float materialShininess;',
            
      'uniform int PASS_TYPE;',
            
      /* light uniforms */
      'uniform vec3 LIGHT_DIRECTION, LIGHT_POSITION;',
      'uniform vec4 LIGHT_SPECULAR, LIGHT_AMBIENT, LIGHT_DIFFUSE;',
      'uniform bool LIGHT_ENABLED;',
      'uniform int LIGHT_TYPE;',
      'uniform float SPOTLIGHT_COS_CUTOFF, SPOTLIGHT_EXPONENT, LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR,',
                    'LIGHT_ATTENUATION_QUADRATIC;',

      'varying vec3 vNormal, vLightDir, vSpotlightDirection;',
      'varying vec4 vBaseColor;',
      'varying float vDist;',
            
      ''
    ].join("\n");
  }
  
  function buildVertexSource(options) {
    var s = [
      defs(options),
            
      /* attributes */
      'attribute vec4 VERTEX_POSITION, VERTEX_COLOR;',
      'attribute vec3 VERTEX_NORMAL;',
      
      'void main() {',
        'vBaseColor = VERTEX_COLOR;',
        'vNormal = nMatrix * VERTEX_NORMAL;',
            
        /* if it's an ambient pass, then we don't even care about light information */
        'if (PASS_TYPE != '+Jax.Scene.AMBIENT_PASS+') {',
          'if (LIGHT_TYPE == '+Jax.DIRECTIONAL_LIGHT+') {',
            'vLightDir = normalize(nMatrix * -LIGHT_DIRECTION);',
          '} else {',
            'vec3 vec = (mvMatrix*vec4(LIGHT_POSITION,1)).xyz - (mvMatrix * VERTEX_POSITION).xyz;',
            'vLightDir = normalize(vec);',
            'vDist = length(vec);',
          '}',
            
          /* if it's a spotlight, calculate spotlightDirection */
          'if (LIGHT_TYPE == '+Jax.SPOT_LIGHT+') {',
            'vSpotlightDirection = normalize(nMatrix * LIGHT_DIRECTION);',
          '}',
        '}',
            
        'gl_Position = pMatrix * mvMatrix * vec4(VERTEX_POSITION.xyz, 1);',
      '}'
    ];
    return s;
  }
  
  function buildFragmentSource(options) {
    var s = [
      defs(options),
            
      'void main() {',
        'vec4 final_color = vec4(0,0,0,0);',
        'float spotEffect, att = 1.0;',
            
        'if (PASS_TYPE != '+Jax.Scene.AMBIENT_PASS+') {',
          'if (LIGHT_ENABLED) {',
            'vec3 nLightDir = normalize(vLightDir), nNormal = normalize(vNormal);',
            'vec3 halfVector = normalize(nLightDir + vec3(0.0,0.0,1.0));',
            'float NdotL = max(dot(nNormal, nLightDir), 0.0);',

            'if (LIGHT_TYPE != '+Jax.SPOT_LIGHT+' || ',
              '(spotEffect = dot(normalize(vSpotlightDirection), -nLightDir)) > SPOTLIGHT_COS_CUTOFF',
            ') {',
              'if (LIGHT_TYPE != '+Jax.DIRECTIONAL_LIGHT+') {',
                'if (LIGHT_TYPE == '+Jax.SPOT_LIGHT+') { att = pow(spotEffect, SPOTLIGHT_EXPONENT); }',
              
                'att = att / (LIGHT_ATTENUATION_CONSTANT ',
                           '+ LIGHT_ATTENUATION_LINEAR * vDist',
                           '+ LIGHT_ATTENUATION_QUADRATIC * vDist * vDist);',
              '}',
              
              'final_color += att * LIGHT_AMBIENT;',
              'if (NdotL > 0.0) {',
                'float NdotHV = max(dot(nNormal, halfVector), 0.0);',
                'final_color += att * NdotL * materialDiffuse * LIGHT_DIFFUSE;', /* diffuse */
                'final_color += att * materialSpecular * LIGHT_SPECULAR * pow(NdotHV, materialShininess);', /* specular */
              '}',
            '}',
          '}',
        '} else {',
          'final_color += materialAmbient * vBaseColor;',
        '}',
        'gl_FragColor = final_color;',
      '}'
    ];
    return s;
  }
      
  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      attributes: {
        VERTEX_POSITION: function(context, mesh) { return mesh.getVertexBuffer(); },
        VERTEX_COLOR   : function(context, mesh) { return mesh.getColorBuffer();  },
        VERTEX_NORMAL  : function(context, mesh) { return mesh.getNormalBuffer(); }
      },
      uniforms: {
        mvMatrix: { type: "glUniformMatrix4fv", value: function(context) { return context.getModelViewMatrix();  } },
        pMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getProjectionMatrix(); } },
        nMatrix:  { type: "glUniformMatrix3fv", value: function(context) { return context.getNormalMatrix();     } },
        
        materialAmbient: { type: "glUniform4fv", value: function(context) { return options.ambient || [0.2,0.2,0.2,1]; } },
        materialDiffuse: { type: "glUniform4fv", value: function(context) { return options.diffuse || [1,1,1,1]; } },
        materialSpecular: { type: "glUniform4fv", value: function(context) { return options.specular || [1,1,1,1]; } },
        materialShininess: { type: "glUniform1f", value: function(context) { return options.shininess || 0; } },
        
        PASS_TYPE: {type:"glUniform1i",value:function(c,m){return c.current_pass||Jax.Scene.AMBIENT_PASS;}},
        
        LIGHT_ENABLED: {type:"glUniform1i",value:function(c,m){return c.world.lighting.getLight().isEnabled();}},
        LIGHT_DIRECTION: {type:"glUniform3fv", value:function(c,m){return c.world.lighting.getDirection();}},
        LIGHT_POSITION:  {type:"glUniform3fv", value:function(c,m){return c.world.lighting.getPosition();}},
        LIGHT_TYPE: {type:"glUniform1i",value:function(c,m){return c.world.lighting.getType();}},
        LIGHT_SPECULAR:{type:"glUniform4fv",value:function(c,m){return c.world.lighting.getSpecularColor(); } },
        LIGHT_AMBIENT: {type:"glUniform4fv",value:function(c,m){return c.world.lighting.getAmbientColor(); } },
        LIGHT_DIFFUSE: {type:"glUniform4fv",value:function(c,m){return c.world.lighting.getDiffuseColor(); } },
        SPOTLIGHT_COS_CUTOFF: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getSpotCosCutoff(); } },
        SPOTLIGHT_EXPONENT: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getSpotExponent(); } },
        LIGHT_ATTENUATION_CONSTANT: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getConstantAttenuation();}},
        LIGHT_ATTENUATION_LINEAR: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getLinearAttenuation();}},
        LIGHT_ATTENUATION_QUADRATIC: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getQuadraticAttenuation();}}
      }
    };
  }
})();
