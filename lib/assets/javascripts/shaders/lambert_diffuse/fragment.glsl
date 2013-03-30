// Lambert formula: L dot N * C * Il,
//   where L is direction from surface to light, N is normal, C is color, Il is light intensity
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass. Light intensity is held constant 
// at 1.0 and attenuation is calculated in a different layer.

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    cache(vec3, NormalizedEyeSpaceSurfaceNormal) {
      bool useVertexNormal = true;
      import(UseVertexNormal, useVertexNormal = UseVertexNormal);
      vec3 normal = vec3(0.0, 0.0, 0.0);
      if (useVertexNormal) normal = vEyeSpaceSurfaceNormal;
      import(Normal, normal = normal + Normal);
      // handle double sided lighting, when cull face isn't BACK
      if (!gl_FrontFacing) normal = -normal;
      NormalizedEyeSpaceSurfaceNormal = normalize(normal);
    }
  
    vec3 L;
    float d = 1.0;
    if (LightType == <%= Jax.DIRECTIONAL_LIGHT %>) {
      L = -EyeSpaceLightDirection;
      d = 1.0;
    } else {
      L = EyeSpaceLightPosition - vEyeSpaceSurfacePosition;
      d = length(L);
      L /= d;
    }
  
    cache(float, SpotAttenuation) {
      float cosCurAngle = dot(-L, EyeSpaceLightDirection);
      float cosInnerMinusOuterAngle = LightSpotInnerCos - LightSpotOuterCos;
      SpotAttenuation = clamp((cosCurAngle - LightSpotOuterCos) / cosInnerMinusOuterAngle, 0.0, 1.0);
    }
  
    // this is cached here so that attenuation can get a handle on it
    // FIXME we probably need a better interface for this sort of thing
    cache(float, LightDistanceFromSurface) { LightDistanceFromSurface = d; }
  
    float intensity = LightDiffuseColor.a * MaterialDiffuseIntensity;
    vec3 C =  LightDiffuseColor.rgb * MaterialDiffuseColor.rgb;

    float lambert = max(dot(NormalizedEyeSpaceSurfaceNormal, L), 0.0);
    float diffuse = lambert * SpotAttenuation * intensity;
    vec4 color = vec4(C * diffuse, MaterialDiffuseColor.a * diffuse);
    import(VertexColor, color *= VertexColor);
    gl_FragColor += color;
  }
}
