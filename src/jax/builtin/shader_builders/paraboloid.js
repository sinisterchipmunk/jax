/*
  Dual paraboloid shader - used for dual paraboloid environment mapping
 */
Jax.shader_program_builders['paraboloid'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec4 vertexPosition;" +
    
            "uniform mat4 mvMatrix;",
            "uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;",
            'uniform float DP_DIRECTION;',
            
            'varying float vClip;',
            'varying vec4 vPos;',
            
            "void main(void) {",
              /*
                we do our own projection to form the paraboloid, so we
                can ignore the projection matrix entirely.
               */
              'vec4 pos = mvMatrix * vertexPosition;',
            
              'pos = vec4(pos.xyz / pos.w, pos.w);',
            
              'pos.z *= DP_DIRECTION;',

              'float L = length(pos.xyz);',
              'pos /= L;',
              'vClip = pos.z;',
            
              'pos.z += 1.0;',
              'pos.x /= pos.z;',
              'pos.y /= pos.z;',
              'pos.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);',
              'pos.w = 1.0;',
            
              'vPos = pos;',
              'gl_Position = pos;',
            "}"]
  }
  
  function buildFragmentSource(options) {
    return [
            'varying float vClip;',
            'varying vec4 vPos;',
          
            'vec4 pack_depth(const in float depth)',
            '{',
              'const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);',
              'const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);',
              'vec4 res = fract(depth * bit_shift);',
              'res -= res.xxyz * bit_mask;',
              'return res;',
            '}',

            "void main(void) {",
              /* because we do our own projection, we also have to do our own clipping */
              /* if vClip is less than 0, it's behind the near plane and can be dropped. */
              'if (vClip < 0.0) discard;',
              'gl_FragColor = pack_depth(vPos.z);',
//              'gl_FragColor = pack_depth(gl_FragCoord.z);',
            '}'];
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
        DP_SHADOW_NEAR: {
          type: "glUniform1f",
          value: function(c) { return 0.1;}//c.world.lighting.getLight().getDPShadowNear()||0.1; }
        },
        DP_SHADOW_FAR: {
          type: "glUniform1f",
          value: function(c) { return 500;}//c.world.lighting.getLight().getDPShadowFar()||500; }
        },
        DP_DIRECTION: {
          type: "glUniform1f",
          value: function(c,m,o) { return o &&  o.direction || 1; }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); }
      }
    };
  }
})();
