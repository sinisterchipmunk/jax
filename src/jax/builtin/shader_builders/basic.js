/*
  Basic shading. Emulates a single directional light to give objects more depth, but relies entirely
  upon the object's own texturing and coloring. No shadowing effects are applied, and no other lighting
  models can be added, removed or changed. Useful for rendering "plastic" geometry in certain
  circumstances. Can be a decent debugging tool, but in general, 'blinn-phong' is a more versatile shader.
 */
Jax.shader_program_builders['basic'] = (function() {
  function defs(options) {
    var textureDefs = [];
    if (options.textures) {
      for (var i = 0; i < options.textures.length; i++) {
        textureDefs.push(
          "uniform sampler2D TEXTURE"+i+";"
        );
      }
    }
    
    return [
      /* matrix uniforms */
      'uniform mat4 mMatrix, ivMatrix, mvMatrix, pMatrix;',
      'uniform mat3 ivnMatrix, nMatrix;',
      
      /* material uniforms */
      'uniform vec4 materialDiffuse, materialAmbient, materialSpecular;',
      'uniform float materialShininess;',
            
      'uniform int PASS_TYPE;',
            
      'varying vec2 vTexCoords;',
      'varying vec3 vNormal, vLightDir;',
      'varying vec4 vBaseColor;',
            
      'const vec4 LIGHT_AMBIENT   = vec4(0.4, 0.4, 0.4, 1.0);',
      'const vec4 LIGHT_DIFFUSE   = vec4(0.6, 0.6, 0.6, 1.0);',
      'const vec4 LIGHT_SPECULAR  = vec4(1.0, 1.0, 1.0, 1.0);',
      'const vec3 LIGHT_DIRECTION = vec3(-1.0, -1.0, -1.0);',
      
      textureDefs.join("\n"),
      ''
    ].join("\n");
  }
  
  function buildVertexSource(options) {
    return [defs(options),
            "attribute vec2 VERTEX_TEXCOORDS;",
            "attribute vec3 VERTEX_NORMAL;",
            "attribute vec4 VERTEX_POSITION, VERTEX_COLOR;",
    
            "void main(void) {",
              'vBaseColor = VERTEX_COLOR;',
              'vNormal = nMatrix * VERTEX_NORMAL;',
              'vTexCoords = VERTEX_TEXCOORDS;',
                    
              'vLightDir = normalize(ivnMatrix * -normalize(LIGHT_DIRECTION));',
              'gl_Position = pMatrix * mvMatrix * vec4(VERTEX_POSITION.xyz, 1);',
            "}"]
  }
  
  function buildFragmentSource(options) {
    var textureColors = [];
    for (var i = 0; options.textures && i < options.textures.length; i++) {
      textureColors.push(
        'final_color *= texture2D(TEXTURE'+i+', vTexCoords);'
      );
    }
    
    return [defs(options),
    
            "void main(void) {",
              'vec4 final_color = materialAmbient * vBaseColor + LIGHT_AMBIENT * vBaseColor;',

              'if (PASS_TYPE != '+Jax.Scene.ILLUMINATION_PASS+') {',
                'vec3 nLightDir = normalize(vLightDir), nNormal = normalize(vNormal);',
                'vec3 halfVector = normalize(nLightDir + vec3(0.0,0.0,1.0));',
                'float NdotL = max(dot(nNormal, nLightDir), 0.0);',
    
                'if (NdotL > 0.0) {',
                  'float NdotHV = max(dot(nNormal, halfVector), 0.0);',
                  'final_color += vBaseColor * NdotL * materialDiffuse * LIGHT_DIFFUSE;',
                  'final_color += vBaseColor * materialSpecular * LIGHT_SPECULAR * pow(NdotHV, materialShininess);',
                '}',
            
                textureColors.join("\n"),
                'gl_FragColor = final_color;',
              '} else {',
                /*
                  since we don't care about other lights, don't bother showing anything for them.
                  Actually, this is just a fail-safe, because this shader will usually be used only during
                  either an ambient pass, or when lighting is disabled, or when there are no lights at all.
                */
                'discard;',
              '}',
            "}"]
  }
  
  return function(options) {
    var result = {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      attributes: {
        VERTEX_POSITION : function(context, mesh) { return mesh.getVertexBuffer(); },
        VERTEX_COLOR    : function(context, mesh) { return mesh.getColorBuffer();  },
        VERTEX_NORMAL   : function(context, mesh) { return mesh.getNormalBuffer(); },
        VERTEX_TEXCOORDS: function(context, mesh) { return mesh.getTextureCoordsBuffer(); }
      },
      uniforms: {
        mMatrix:  { type:"glUniformMatrix4fv",  value: function(c) { return c.getModelMatrix(); } },
        ivnMatrix:{ type:"glUniformMatrix3fv",  value: function(c) { return mat3.transpose(mat4.toMat3(c.getViewMatrix())); }},
        ivMatrix: { type: "glUniformMatrix4fv", value: function(c) { return c.getInverseViewMatrix(); }},
        mvMatrix: { type: "glUniformMatrix4fv", value: function(context) { return context.getModelViewMatrix();  } },
        pMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getProjectionMatrix(); } },
        nMatrix:  { type: "glUniformMatrix3fv", value: function(context) { return context.getNormalMatrix();     } },
        
        materialAmbient:  { type: "glUniform4fv", value: function(context) { return options.ambient; } },
        materialDiffuse:  { type: "glUniform4fv", value: function(context) { return options.diffuse; } },
        materialSpecular: { type: "glUniform4fv", value: function(context) { return options.specular; } },
        materialShininess:{ type: "glUniform1f",  value: function(context) { return options.shininess; } },
        
        PASS_TYPE: {type:"glUniform1i",value:function(c,m){return c.current_pass;}}
      }
    };
    
    if (options.textures)
      for (var i = 0; i < options.textures.length; i++)
        result.uniforms['TEXTURE'+i] = { type:"glUniform1i", i:i, value:function(c,m,o) {
          var tex = o && o.material && o.material.textures[this.i];
          if (tex && tex.loaded) tex.bind(c, this.i);
          return this.i;
        }
      };
    
    return result;
  }
})();
