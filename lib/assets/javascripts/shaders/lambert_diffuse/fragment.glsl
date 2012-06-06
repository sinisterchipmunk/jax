// Lambert formula: L dot N * C * Il,
//   where L is direction from surface to light, N is normal, C is color, Il is light intensity
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass. Light intensity is held constant 
// at 1.0 and attenuation is calculated in a different layer.

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    vec3 N = normalize(vEyeSpaceSurfaceNormal);
    
    vec3 L;
    float Il = 1.0;
    if (LightType == <%= Jax.DIRECTIONAL_LIGHT %>) {
      L = -EyeSpaceLightDirection;
      export(float, LightDistanceFromSurface, -1.0);
    } else {
      L = EyeSpaceLightPosition - vEyeSpaceSurfacePosition;
      float d = export(float, LightDistanceFromSurface, length(L));
      L /= d;
      
      float cosCurAngle = dot(-L, EyeSpaceLightDirection);
      float cosInnerMinusOuterAngle = LightSpotInnerCos - LightSpotOuterCos;
      Il = clamp((cosCurAngle - LightSpotOuterCos) / cosInnerMinusOuterAngle, 0.0, 1.0);
    }
    
    vec3 C =  LightDiffuseColor.rgb * MaterialDiffuseColor.rgb *
              MaterialDiffuseColor.a * MaterialDiffuseIntensity;

    float lambert = dot(N, L);
    gl_FragColor += vec4(lambert * C * Il, 1.0);
  }
}
