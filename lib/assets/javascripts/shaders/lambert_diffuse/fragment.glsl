// Lambert formula: L dot N * C * Il,
//   where L is direction from surface to light, N is normal, C is color, Il is light intensity
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass. Light intensity is held constant 
// at 1.0 and attenuation is calculated in a different layer.

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    cache(vec3, NormalizedEyeSpaceSurfaceNormal) {
      NormalizedEyeSpaceSurfaceNormal = normalize(vEyeSpaceSurfaceNormal);
    }
  
    for (int LIGHT = 0; LIGHT < MAX_LIGHTS; LIGHT++) {
      vec3 L;
      float d = 1.0;
      if (LightType[LIGHT] == <%= Jax.DIRECTIONAL_LIGHT %>) {
        L = -EyeSpaceLightDirection[LIGHT];
        d = 1.0;
      } else {
        L = EyeSpaceLightPosition[LIGHT] - vEyeSpaceSurfacePosition;
        d = length(L);
        L /= d;
      }
    
      cache(float, SpotAttenuation[MAX_LIGHTS]) {
        float cosCurAngle = dot(-L, EyeSpaceLightDirection[LIGHT]);
        float cosInnerMinusOuterAngle = LightSpotInnerCos[LIGHT] - LightSpotOuterCos[LIGHT];
        SpotAttenuation[LIGHT] = clamp((cosCurAngle - LightSpotOuterCos[LIGHT]) / cosInnerMinusOuterAngle, 0.0, 1.0);
      }
    
      // this is cached here so that attenuation can get a handle on it
      // FIXME we probably need a better interface for this sort of thing
      cache(float, LightDistanceFromSurface[MAX_LIGHTS]) { LightDistanceFromSurface[LIGHT] = d; }
    
      vec3 C =  LightDiffuseColor[LIGHT].rgb * MaterialDiffuseColor.rgb *
                MaterialDiffuseColor.a * MaterialDiffuseIntensity;

      float lambert = dot(NormalizedEyeSpaceSurfaceNormal, L);
      gl_FragColor += vec4(lambert * C * SpotAttenuation[LIGHT], 1.0);
    }
  }
}
