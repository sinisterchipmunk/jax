// Phong formula: Is = Sm x Sl x pow( max(R dot E, 0.0), f )
//   where Sl is the light specular color, Sm is the material specular color,
//     E is the view vector, and R is the reflected light vector.
//
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass.

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    cache(vec3, NormalizedEyeSpaceSurfaceNormal) {
      NormalizedEyeSpaceSurfaceNormal = normalize(vEyeSpaceSurfaceNormal);
    }
  
    for (int LIGHT = 0; LIGHT < MAX_LIGHTS; LIGHT++) {
      vec3 L;
      if (LightType[LIGHT] == <%= Jax.DIRECTIONAL_LIGHT %>) {
        L = -EyeSpaceLightDirection[LIGHT];
      } else {
        L = normalize(EyeSpaceLightPosition[LIGHT] - vEyeSpaceSurfacePosition);
      }

      cache(float, SpotAttenuation[MAX_LIGHTS]) {
        float cosCurAngle = dot(-L, EyeSpaceLightDirection[LIGHT]);
        float cosInnerMinusOuterAngle = LightSpotInnerCos[LIGHT] - LightSpotOuterCos[LIGHT];
        SpotAttenuation[LIGHT] = clamp((cosCurAngle - LightSpotOuterCos[LIGHT]) / cosInnerMinusOuterAngle, 0.0, 1.0);
      }

      float lambert = dot(NormalizedEyeSpaceSurfaceNormal, L);
      if (lambert > 0.0) {
        vec3 R = reflect(L, NormalizedEyeSpaceSurfaceNormal);
        vec3 C = MaterialSpecularColor.rgb * LightSpecularColor[LIGHT].rgb;
        vec3 E = normalize(vEyeSpaceSurfacePosition);
        gl_FragColor += vec4(C * SpotAttenuation[LIGHT] * MaterialSpecularIntensity * pow(max(dot(R, E), 0.0), MaterialShininess), 1.0);
      }
    }
  }
}
