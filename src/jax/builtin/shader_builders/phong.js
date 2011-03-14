Jax.shader_program_builders['phong'] = (function() {
  var MAX_LIGHTS = Jax.max_lights;
  
  function defLights() {
    var result = ["uniform bool lightingEnabled;"];
    
    for (var i = 0; i < MAX_LIGHTS; i++) {
      result.push(
              'uniform float lightConstantAttenuation'+i+',                    ',
              '              lightLinearAttenuation'+i+',                      ',
              '              lightQuadraticAttenuation'+i+';                   ',
              'uniform vec3 lightPosition'+i+';                                ',
              'varying vec3 lightDirection'+i+';                               ',
              'varying float lightAtt'+i+';                                    ',
              'uniform bool lightEnabled'+i+';                                              ',
              'uniform vec4 lightAmbient'+i+',   // [0.0,0.0,0.0,1.0]                       ',
              '             lightDiffuse'+i+',   // [1.0,1.0,1.0,1.0]                       ',
              '             lightSpecular'+i+';  // [1.0,1.0,1.0,1.0]                       ',
              ''
      )
    }
    
    return result.join("\n");
  }
  
  function buildVertexSource(options) {
    function calculateLights() {
      var result = [
        'if (lightingEnabled == true) {'];
      for (var i = 0; i < MAX_LIGHTS; i++) result.push(
        '  if (lightEnabled'+i+' == true) {',
        '    lightDirection'+i+' = vec3(lightPosition'+i+' - vVertex);       ',
        '    d = length(lightDirection'+i+');                            ',
        '    lightAtt'+i+' = 1.0 / ( lightConstantAttenuation'+i+' +         ',
        '    (lightLinearAttenuation'+i+'*d) +                           ',
        '    (lightQuadraticAttenuation'+i+'*d*d) );                     ',
        '  }',
        ''
      )
      result.push('}');
      return result.join("\n");
    }
    
    return [
      defLights(),
      'varying vec3 normal, eyeVec;                                ',
      'varying vec4 color;                                         ',
      'attribute vec3 vertexPosition, vertexNormal;                ',
      'attribute vec4 vertexColor;                                 ',
      'uniform mat4 mvMatrix, pMatrix, nMatrix;                    ',
  
      'void main()                                                 ',
      '{	                                                       ',
      '    float d;                                                ',
      '    normal = vec3(nMatrix * vec4(vertexNormal, 1));         ',
      '    vec3 vVertex = vec3(mvMatrix * vec4(vertexPosition, 1));',
      '    eyeVec = -vVertex;                                      ',
      '    color = vertexColor;                                    ',
      
      calculateLights(),
      
      '    gl_Position = pMatrix * vec4(vertexPosition,1);         ',
      '}'
    ];
  }
  
  function buildFragmentSource(options) {
    function calculateLights() {
      var result = [
        '  if (lightingEnabled) {                                                 ',
        '    final_color = final_color * matr_ambient;                            '
      ];
      
      for (var i = 0; i < MAX_LIGHTS; i++) result.push(
        '    if (lightEnabled'+i+' == true) {                                         ',
        '      final_color = final_color + (lightAmbient'+i+'*matr_ambient)*lightAtt'+i+';',
        '      L = normalize(lightDirection'+i+');                                    ',
        '      lambertTerm = dot(N,L);                                            ',
        '      if(lambertTerm > 0.0)                                              ',
        '      {                                                                  ',
        '        final_color += lightDiffuse'+i+'*matr_diffuse*lambertTerm*lightAtt'+i+'; ',
        '        R = reflect(-L, N);                                              ',
        '        specular = pow( max(dot(R, E), 0.0), matr_shininess);            ',
        '        final_color += lightSpecular'+i+'*matr_specular*specular*lightAtt'+i+';  ',
        '      }                                                                  ',
        '    }                                                                    ',
        ''
      );
      
      result.push('}');
      return result.join("\n");
    }
    
    return [
      defLights(),
      'uniform vec4 matr_ambient,    // [0.3,0.3,0.3,1.0]                       ',
      '             matr_diffuse,    // [0.9,0.5,0.5,1.0]                       ',
      '             matr_specular;   // [0.6,0.6,0.6,1.0]                       ',
      'uniform float matr_shininess; // 60                                      ',
      'varying vec3 normal, eyeVec;                                             ',
      'varying vec4 color;                                                      ',

      'void main (void)                                                         ',
      '{                                                                        ',
      '  vec3 N = normalize(normal), L, E = normalize(eyeVec), R;               ',
      '  float lambertTerm, specular;                                           ',

      '  vec4 final_color = color;                                              ',
      '  // texture, colorcoords, etc                                           ',
	
      calculateLights(),

      '  gl_FragColor = final_color;			                                ',
      '}                                                                        '
            
    ];
  }
  
  return function(options) {
    var result = {
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
        nMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getNormalMatrix();     } },
        lightingEnabled: { type: "glUniform1i", value: function(context) { return context.world.lighting.isEnabled() ? 1 : 0 } },
        matr_ambient: { type: "glUniform4fv", value: function(context) { return options.colors.ambient || [0.2,0.2,0.2,1]; } },
        matr_diffuse: { type: "glUniform4fv", value: function(context) { return options.colors.diffuse || [1,1,1,1]; } },
        matr_specular: { type: "glUniform4fv", value: function(context) { return options.colors.specular || [1,1,1,1]; } },
        matr_shininess: { type: "glUniform1f", value: function(context) { return options.glossiness; } }
      }
    };
    
    for (var i = 0; i < MAX_LIGHTS; i++)
    {
      var j = i;
      result.uniforms['lightDiffuse'+i] = { type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getDiffuseColor(j);
      } };
      
      result.uniforms['lightSpecular'+i] = { type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getSpecularColor(j);
      } };
      
      result.uniforms['lightAmbient'+i] = { type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getAmbientColor(j);
      } };
      
      result.uniforms['lightEnabled'+i] = { type: "glUniform1i", value: function(ctx) {
        return ctx.world.lighting.isEnabled(j) ? 1 : 0;
      } };
      
      result.uniforms['lightPosition'+i] = { type: "glUniform3fv", value: function(ctx) {
        return ctx.world.lighting.getPosition(j);
      } };
      
      result.uniforms['lightConstantAttenuation'+i] = { type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getConstantAttenuation(j);
      } };

      result.uniforms['lightLinearAttenuation'+i] = { type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getLinearAttenuation(j);
      } };

      result.uniforms['lightQuadraticAttenuation'+i] = { type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getQuadraticAttenuation(j);
      } };
    }
    
    return result;
  }
})();
