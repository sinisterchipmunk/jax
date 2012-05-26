shared attribute vec4 VERTEX_POSITION;

void main(void) {
  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%> && SHADOWMAP_ENABLED) {
    vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;
    
    /* Perform dual-paraboloid shadow map calculations - for point lights only */
    vec4 p = vShadowCoord;
    vec3 pos = p.xyz / p.w;
          
    float L = length(pos.xyz);
    vDP0.xyz = pos / L;
    vDP1.xyz = pos / L;
      
    vDP0.w = pos.z;    
    //vDPz = pos.z;
          
    vDP0.z = 1.0 + vDP0.z;
    vDP0.x /= vDP0.z;
    vDP0.y /= vDP0.z;
    vDP0.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);
          
    vDP0.x =  0.5 * vDP0.x + 0.5;
    vDP0.y =  0.5 * vDP0.y + 0.5;
          
    vDP1.z = 1.0 - vDP1.z;
    vDP1.x /= vDP1.z;
    vDP1.y /= vDP1.z;
    vDP1.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);
      
    vDP1.x =  0.5 * vDP1.x + 0.5;
    vDP1.y =  0.5 * vDP1.y + 0.5;
          
    float map_depth, depth;
    vec4 rgba_depth;
      
    if (vDP0.w > 0.0) {    
    //if (vDPz > 0.0) {
      vDP1.w = vDP0.z;
      //vDPDepth = vDP0.z;
    } else {
      vDP1.w = vDP1.z;
      //vDPDepth = vDP1.z;
    }
  }
}
