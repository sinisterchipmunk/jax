/*
  Depthmap shader - used by light sources to generate shadow maps.
 */
Jax.shader_program_builders['depthmap'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec4 vertexPosition;",
    
            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",
            
            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vertexPosition;",
            "}"]
  }
  
  function buildFragmentSource(options) {
    return [
            'vec4 pack_depth(const in float depth)',
            '{',
              'const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);',
              'const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);',
              'vec4 res = fract(depth * bit_shift);',
              'res -= res.xxyz * bit_mask;',
              'return res;',
            '}',

            'float linearize(in float z) {',
              'float A = pMatrix[2].z, B = pMatrix[3].z;',
              'float n = - B / (1.0 - A);', // camera z near
              'float f =   B / (1.0 + A);', // camera z far
              'return (2.0 * n) / (f + n - z * (f - n));',
            '}',
            
            'void main(void) {',
              'gl_FragColor = pack_depth(gl_FragCoord.z*0.5+0.5);',
            '}']
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
