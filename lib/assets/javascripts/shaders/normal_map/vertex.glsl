shared attribute vec4 VERTEX_POSITION;
shared attribute vec2 VERTEX_TEXCOORDS;
shared attribute vec4 VERTEX_TANGENT;
shared attribute vec3 VERTEX_NORMAL;

void main(void) {
  // ambient was applied by the basic shader; applying it again will simply brighten some fragments
  // beyond their proper ambient value. So, we really need to apply the bump shader ONLY to diffuse+specular.

  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%>) {
    vTexCoords = VERTEX_TEXCOORDS;
    vNormal = nMatrix * VERTEX_NORMAL;

    vSurfacePos = (mvMatrix * VERTEX_POSITION).xyz;

    vec3 ecPosition = vec3(mvMatrix * VERTEX_POSITION);

    gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;
    vTexCoords = VERTEX_TEXCOORDS;

    vEyeDir = vec3(mvMatrix * VERTEX_POSITION);
  
    vec3 n = normalize(nMatrix * VERTEX_NORMAL);
    vec3 t = normalize(nMatrix * VERTEX_TANGENT.xyz);
    vec3 b = cross(n, t) * VERTEX_TANGENT.w;
  
    vec3 v, p;
  
    vAttenuation = 1.0;
  
    if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)
      if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0) {
        // no change to attenuation, but we still need P
        p = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition;
      }
      else {
        // attenuation calculation figures out P for us, so we may as well use it
        vAttenuation = calcAttenuation(ecPosition, p);
      }
    else
      if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>) {
        // attenuation calculation figures out P for us, so we may as well use it
        vAttenuation = calcAttenuation(ecPosition, p);
      }
      else
      { // directional light -- all we need is P
        p = vec3(vnMatrix * -normalize(LIGHT_DIRECTION));
      }
    
    
    
    v.x = dot(p, t);
    v.y = dot(p, b);
    v.z = dot(p, n);
    vLightDir = normalize(p);
  
    v.x = dot(vEyeDir, t);
    v.y = dot(vEyeDir, b);
    v.z = dot(vEyeDir, n);
    vEyeDir = normalize(v);
  }
}
