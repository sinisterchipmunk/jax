Jax.shader_program_builders['phong'] = (function() {
  function defLights(options) {
    var result = ["uniform bool lightingEnabled;"];
    
    for (var i = 0; i < options.light_count; i++) {
      result.push(
              'uniform float lightConstantAttenuation'+i+',                    ',
              '              lightLinearAttenuation'+i+',                      ',
              '              lightQuadraticAttenuation'+i+';                   ',
              'uniform vec3 lightPosition'+i+';                                ',
              'varying vec3 lightDirection'+i+';                               ',
              'varying float lightAtt'+i+';                                    ',
              'uniform bool lightEnabled'+i+';                                 ',
              'uniform vec4 lightAmbient'+i+',                                 ',
              '             lightDiffuse'+i+',                                 ',
              '             lightSpecular'+i+';                                ',
              ''
      )
    }
    
    return result.join("\n");
  }
  
  function buildVertexSource(options) {
    function calculateLights(options) {
      if (!options.light_count) return [];
      
      var result = [ '',
        'if (lightingEnabled) {'];
      for (var i = 0; i < options.light_count; i++) result.push(
        '  if (lightEnabled'+i+' == true) {',
        '    lightDirection'+i+' = vec3(lightPosition'+i+' - vVertex);       ',
        '    d = length(lightDirection'+i+');                            ',
        '    lightAtt'+i+' = 1.0 / ( lightConstantAttenuation'+i+' +         ',
        '    (lightLinearAttenuation'+i+'*d) +                           ',
        '    (lightQuadraticAttenuation'+i+'*d*d) );                     ',
        '  }',
        ''
      )
      result.push('}', '');
      return result.join("\n");
    }
    
    var s = [
      defLights(options),
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
      
      calculateLights(options),
      
      '    gl_Position = pMatrix * mvMatrix * vec4(vertexPosition,1);         ',
      '}'
    ];
//    alert(s.join("\n").replace("    ", ""));

    return s;
  }
  
  function buildFragmentSource(options) {
    function calculateLights() {
      if (!options.light_count) return [];
      
      var result = [ '',
        '  if (lightingEnabled) {                                                 ',
        '    final_color = final_color * matr_ambient;                            '
      ];
      
      for (var i = 0; i < options.light_count; i++) result.push(
        '    if (lightEnabled'+i+') {                                         ',
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
      
      result.push('}', '');
      return result.join("\n");
    }
    
    var s = [
      defLights(options),
      'uniform vec4 matr_ambient,                                               ',
      '             matr_diffuse,                                               ',
      '             matr_specular;                                              ',
      'uniform float matr_shininess;                                            ',
      'varying vec3 normal, eyeVec;                                             ',
      'varying vec4 color;                                                      ',

      'void main (void)                                                         ',
      '{                                                                        ',
      '  vec3 N = normalize(normal), L, E = normalize(eyeVec), R;               ',
      '  float lambertTerm, specular;                                           ',

      '  vec4 final_color = color;                                              ',
	
      calculateLights(options),

      '  gl_FragColor = final_color;			                                ',
      '}                                                                        '
            
    ];
//    alert(s.join("\n").replace("    ", ""));
    return s;
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
        lightingEnabled: { type: "glUniform1i", value: function(context) { return context.world.lighting.isEnabled(); } },
        matr_ambient: { type: "glUniform4fv", value: function(context) { return options.colors.ambient || [0.2,0.2,0.2,1]; } },
        matr_diffuse: { type: "glUniform4fv", value: function(context) { return options.colors.diffuse || [1,1,1,1]; } },
        matr_specular: { type: "glUniform4fv", value: function(context) { return options.colors.specular || [1,1,1,1]; } },
        matr_shininess: { type: "glUniform1f", value: function(context) { return options.glossiness; } }
      }
    };
    
    for (var i = 0; i < options.light_count; i++)
    {
      result.uniforms['lightDiffuse'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getDiffuseColor(this.index);
      } };
      
      result.uniforms['lightSpecular'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getSpecularColor(this.index);
      } };
      
      result.uniforms['lightAmbient'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getAmbientColor(this.index);
      } };
      
      result.uniforms['lightEnabled'+i] = { index: i, type: "glUniform1i", value: function(ctx) {
        return ctx.world.lighting.isEnabled(this.index);
      } };
      
      result.uniforms['lightPosition'+i] = { index: i, type: "glUniform3fv", value: function(ctx) {
        return ctx.world.lighting.getPosition(this.index);
      } };
      
      result.uniforms['lightConstantAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getConstantAttenuation(this.index);
      } };

      result.uniforms['lightLinearAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getLinearAttenuation(this.index);
      } };

      result.uniforms['lightQuadraticAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getQuadraticAttenuation(this.index);
      } };
    }
    
    return result;
  }
})();
