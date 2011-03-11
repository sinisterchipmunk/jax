Jax.shader_program_builders['phong'] = (function() {
  function buildVertexSource(options) {
    var result = "";
    result = "attribute vec3 vertexPosition, vertexNormal, lightPosition;"
           + "uniform mat4 mvMatrix, pMatrix, nMatrix;"
           + "varying vec3 normal, lightDir, eyeVec;"
            
           + "void main() { "
           +   "normal = vec3(nMatrix * vec4(vertexNormal, 1));"
           +   "vec3 vVertex = vec3(mvMatrix * vec4(vertexPosition, 1));"
           +   "lightDir = vec3(lightPosition - vVertex);"
           +   "eyeVec = -vVertex;"
           +   "gl_Position = pMatrix * vec4(vertexPosition, 1);"
           + "}";
    return result;
  }
  
  function buildFragmentSource(options) {
    return ['varying vec3 normal, lightDir, eyeVec;',

            'void main(void) {',
            '  gl_FragColor = vec4(1,1,1,1);',
//            '    vec4 final_color =', 
//            '    (gl_FrontLightModelProduct.sceneColor * gl_FrontMaterial.ambient) +', 
//            '    (gl_LightSource[0].ambient * gl_FrontMaterial.ambient);',
//
//            '    vec3 N = normalize(normal);',
//            '    vec3 L = normalize(lightDir);',
//
//            '    float lambertTerm = dot(N,L);',
//
//            '    if(lambertTerm > 0.0)',
//            '    {',
//            '        final_color += gl_LightSource[0].diffuse *', 
//            '                       gl_FrontMaterial.diffuse * ',
//            '                       lambertTerm;',
//
//            '        vec3 E = normalize(eyeVec);',
//            '        vec3 R = reflect(-L, N);',
//            '        float specular = pow( max(dot(R, E), 0.0),', 
//            '                         gl_FrontMaterial.shininess );',
//            '        final_color += gl_LightSource[0].specular *', 
//            '                       gl_FrontMaterial.specular *', 
//            '                       specular;',	
//            '    }',
//
//            '    gl_FragColor = final_color;',			
            '}'
    ];
  }
  
  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getProjectionMatrix(); }
        },
        nMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getNormalMatrix(); }
        }
      }
    };
  }
})();
