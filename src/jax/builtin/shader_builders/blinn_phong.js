Jax.shader_program_builders['blinn-phong'] = (function() {
  function defineLightVariables(options) {
    var s = [];
    for (var i = 0; i < options.light_count; i++) {
      s.push(
            /* light uniforms */
            'uniform int lightType'+i+';',
            'uniform vec3 lightDirection'+i+', lightPosition'+i+', lightHalfVector'+i+';',
            'uniform vec4 lightDiffuse'+i+', lightAmbient'+i+', lightSpecular'+i+';',
            'uniform float lightConstantAttenuation'+i+', lightLinearAttenuation'+i+', lightQuadraticAttenuation'+i+',',
                          'lightSpotCosCutoff'+i+', lightSpotExponent'+i+';',
            'uniform bool lightEnabled'+i+';',
            '',
            /* light-specific varying */
            'varying vec3 lightDir'+i+', halfVector'+i+', spotlightDirection'+i+';',
            'varying vec4 diffuse'+i+';',
            'varying float dist'+i+';',
            ''
      );
    }
    return s.join("\n");
  }
  
  function vertexLightCalculations(options) {
    var s = ['if (lightingEnabled) {'];
    for (var i = 0; i < options.light_count; i++) {
      s.push(
              'if (lightEnabled'+i+') {',
                'if (lightType'+i+' == '+Jax.DIRECTIONAL_LIGHT+') {',
                  /* now normalize the light's direction. Note that it must be converted to eye space. */
                  'lightDir'+i+' = normalize(vec3(nMatrix * -lightDirection'+i+'));',
                '} else {',
                  'aux = vec3(mvMatrix * vec4(lightPosition'+i+', 1));',
                  'aux = vec3(aux - eyePosition.xyz);',
                  'lightDir'+i+' = normalize(aux);',
                  'dist'+i+' = length(aux);',
                '}',
              
                /* if it's a spotlight, calculate spotlightDirection */
                'if (lightType'+i+' == '+Jax.SPOT_LIGHT+') {',
                  'spotlightDirection'+i+' = normalize(vec3(nMatrix * lightDirection'+i+'));',
                '}',
              
                'halfVector'+i+' = normalize(eyeVector+lightDir'+i+');',
                'diffuse'+i+' = materialDiffuse * lightDiffuse'+i+';',
              '}',
              ''
      );
    }
    s.push('}');
    return s.join("\n");
  }
  
  function buildVertexSource(options) {
    var s = [
            'uniform bool lightingEnabled;',
            
            /* matrix uniforms */
            'uniform mat4 mvMatrix, pMatrix;',
            'uniform mat3 nMatrix;',
            
            /* material uniforms */
            'uniform vec4 materialDiffuse, materialAmbient, materialSpecular;',
            'uniform float materialShininess;',

            defineLightVariables(options),
                                          
            /* attributes */
            'attribute vec3 vertexPosition, vertexNormal;',
            'attribute vec4 vertexColor;',
                  
            'varying vec3 normal;',
            'varying vec4 baseColor;',
            
            'void main() {',
              'vec4 eyePosition;',
              'vec3 eyeVector, aux;',
            
              /* get the eye vector from the vertex position to the eye (camera) position */
              'eyePosition = mvMatrix * vec4(vertexPosition, 1);',
              'eyeVector = -normalize(eyePosition.xyz);',
                  
              /* transform the normal into eye space and normalize the result */
              'normal = normalize(vec3(nMatrix * vertexNormal));',
            
              vertexLightCalculations(options),
                       
              'baseColor = vertexColor;',
              'gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1);',
            '}'
    ];
    return s;
  }
  
  function fragmentLightCalculations(options) {
    var s = ['if (lightingEnabled) {'];
    for (var i = 0; i < options.light_count; i++) {
      s.push(
        'if (lightEnabled'+i+') {',
          /*
            compute the cos of the angle between the normal and light directions.
            The light is directional so the direction is constant for every vertex.
            Since these are normalized the cosine is the dot product. We also need
            to clamp to the [0,1] range.
           */
          'NdotL = max(dot(n, normalize(lightDir'+i+')), 0.0);',
        
          /* TODO: it feels like all these conditions could be optimized a bit */
          'if (lightType'+i+' != '+Jax.SPOT_LIGHT+' || ',
            '(spotEffect = dot(normalize(spotlightDirection'+i+'), normalize(-lightDir'+i+'))) > lightSpotCosCutoff'+i+'',
          ') {',
            'if (lightType'+i+' != '+Jax.DIRECTIONAL_LIGHT+') {',
              'if (lightType'+i+' == '+Jax.SPOT_LIGHT+') { att = pow(spotEffect, lightSpotExponent'+i+'); }',
              'else { att = 1.0; }',
        
              'att = att / (lightConstantAttenuation'+i+' ',
                         '+ lightLinearAttenuation'+i+' * dist'+i,
                         '+ lightQuadraticAttenuation'+i+' * dist'+i+' * dist'+i+');',
            '} else { att = 1.0; }',
      
            'if (NdotL > 0.0) {',
              'final_color += att * (diffuse'+i+' * NdotL + lightAmbient'+i+');',
          
              /* normalize the half-vector, then compute the cosine (dot product) with the normal */
              'halfV = normalize(halfVector'+i+');',
              'NdotHV = max(dot(n, halfV), 0.0);',
              'final_color += att * materialSpecular * lightSpecular'+i+' * pow(NdotHV, materialShininess);',
            '} else { final_color += att * lightAmbient'+i+'; }',
          '}',
        '}',
        ''
      );
    }
    s.push('}');
    return s.join("\n");
  }
  
  function buildFragmentSource(options) {
    var s = [
            'uniform bool lightingEnabled;',
            
            /* material uniforms */
            'uniform vec4 materialDiffuse, materialAmbient, materialSpecular;',
            'uniform float materialShininess;',

            defineLightVariables(options),
            
            /* varying */
            'varying vec3 normal;',
            'varying vec4 baseColor;',

            'void main() {',
              'vec4 final_color = materialAmbient;',
              'float NdotL, NdotHV, att, spotEffect;',
              'vec3 n = normalize(normal), halfV;',
            
              fragmentLightCalculations(options),
            
              'gl_FragColor = final_color * baseColor;',
            '}'
    ];
    return s;
  }
  
  return function(options) {
    var result = {
      supports_shadows: true,
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); },
        vertexColor   : function(context, mesh) { return mesh.getColorBuffer();  },
        vertexNormal  : function(context, mesh) { return mesh.getNormalBuffer(); }
      },
      uniforms: {
        mvMatrix: { type: "glUniformMatrix4fv", value: function(context) { return context.getModelViewMatrix();  } },
        pMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getProjectionMatrix(); } },
        nMatrix:  { type: "glUniformMatrix3fv", value: function(context) { return context.getNormalMatrix();     } },
        
        materialAmbient: { type: "glUniform4fv", value: function(context) { return options.ambient || [0.2,0.2,0.2,1]; } },
        materialDiffuse: { type: "glUniform4fv", value: function(context) { return options.diffuse || [1,1,1,1]; } },
        materialSpecular: { type: "glUniform4fv", value: function(context) { return options.specular || [1,1,1,1]; } },
        materialShininess: { type: "glUniform1f", value: function(context) { return options.shininess || 0; } },
        
        lightingEnabled: { type: "glUniform1i", value: function(context) { return context.world.lighting.isEnabled(); } }
      }
    };
    
    for (var i = 0; i < options.light_count; i++) {
      result.uniforms['lightDirection'+i] = { i:i,type:"glUniform3fv",value:function(c){return c.world.lighting.getDirection(this.i);}};
      result.uniforms['lightHalfVector'+i] = { i:i,type:"glUniform4fv",value:function(c){
        { return vec3.normalize(vec3.add(c.player.camera.getPosition(), c.world.lighting.getDirection(this.i), vec3.create())); }
      }};
      
      result.uniforms['lightPosition'+i] = {i:i,type:"glUniform3fv",value:function(c){return c.world.lighting.getPosition(this.i);}};

      result.uniforms['lightDiffuse'+i] = {i:i,type:"glUniform4fv",value:function(c){return c.world.lighting.getDiffuseColor(this.i); } };
      result.uniforms['lightAmbient'+i] = {i:i,type:"glUniform4fv",value:function(c){return c.world.lighting.getAmbientColor(this.i); } };
      result.uniforms['lightSpecular'+i] = {i:i,type:"glUniform4fv",value:function(c){return c.world.lighting.getSpecularColor(this.i); } };

      result.uniforms['lightType'+i] = {i:i,type:"glUniform1i", value: function(ctx) { return ctx.world.lighting.getType(this.i); } };

      result.uniforms['lightConstantAttenuation'+i] = {i:i,type:"glUniform1f", value: function(ctx) { return ctx.world.lighting.getConstantAttenuation(this.i); } };
      result.uniforms['lightLinearAttenuation'+i] = {i:i,type:"glUniform1f", value: function(ctx) { return ctx.world.lighting.getLinearAttenuation(this.i); } };
      result.uniforms['lightQuadraticAttenuation'+i] = {i:i,type:"glUniform1f", value: function(ctx) { return ctx.world.lighting.getQuadraticAttenuation(this.i); } };
      result.uniforms['lightSpotCosCutoff'+i] = {i:i,type:"glUniform1f", value: function(ctx) { return ctx.world.lighting.getSpotCosCutoff(this.i); } };
      result.uniforms['lightSpotExponent'+i] = {i:i,type: "glUniform1f", value: function(ctx) { return ctx.world.lighting.getSpotExponent(this.i); } };
      
      result.uniforms['lightEnabled'+i] = {i:i,type:"glUniform1i",value: function(c){return c.world.lighting.isEnabled(this.i); } };
    }
    
    return result;
  };
})();
