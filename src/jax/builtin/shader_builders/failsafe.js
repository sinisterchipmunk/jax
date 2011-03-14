/*
  Failsafe shader - useful for debugging. Renders an object using vertex data only. The object's
  color is hard-coded to pure white.
 */
Jax.shader_program_builders['failsafe'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",
    
            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",
    
            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "}"]
  }
  
  function buildFragmentSource(options) {
    return ["void main(void) {",
            "  gl_FragColor = vec4(1,1,1,1);",
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
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); }
      }
    };
  }
})();
