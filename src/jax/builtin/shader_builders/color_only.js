Jax.shader_program_builders['color_only'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",
            "attribute vec4 vertexColor;",
    
            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",
    
            "varying vec4 vColor;",
    
            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "  vColor = vertexColor;",
            "}"]
  }
  
  function buildFragmentSource(options) {
    return ["varying vec4 vColor;",
    
            "void main(void) {",
            "  gl_FragColor = vColor;",
            "}"]
  }
  
  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); },
        vertexColor   : function(context, mesh) { return mesh.getColorBuffer();  }
      }
    };
  }
})();
