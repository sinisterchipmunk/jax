// Phong formula: Is = Sm x Sl x pow( max(R dot E, 0.0), f )
//   where Sl is the light specular color, Sm is the material specular color,
//     E is the view vector, and R is the reflected light vector.
//
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass.

void main(void) {
  // instead of `a && b`, use `all(bvec*)` for compatibility with ATI cards
  bvec2 enabled = bvec2(
    // no output on ambient pass
    PASS != 0,

    // if MaterialShininess == 0.0, then the specular formula will be 
    // fubarred so instead, it should be skipped entirely.
    MaterialShininess > 0.0
  );
  if (all(enabled)) {
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
    if (LightType == <%= Jax.DIRECTIONAL_LIGHT %>) {
      L = -EyeSpaceLightDirection;
    } else {
      L = normalize(EyeSpaceLightPosition - vEyeSpaceSurfacePosition);
    }

    cache(float, SpotAttenuation) {
      float cosCurAngle = dot(-L, EyeSpaceLightDirection);
      float cosInnerMinusOuterAngle = LightSpotInnerCos - LightSpotOuterCos;
      SpotAttenuation = clamp((cosCurAngle - LightSpotOuterCos) / cosInnerMinusOuterAngle, 0.0, 1.0);
    }

    float lambert = dot(NormalizedEyeSpaceSurfaceNormal, L);
    if (lambert > 0.0) {
      vec3 R = reflect(L, NormalizedEyeSpaceSurfaceNormal);
      vec3 C = MaterialSpecularColor.rgb * LightSpecularColor.rgb;
      vec3 E = normalize(vEyeSpaceSurfacePosition);
      float specularIntensity = MaterialSpecularIntensity;
      import(SpecularIntensity, specularIntensity *= SpecularIntensity);
      specularIntensity *= SpotAttenuation * pow(clamp(dot(R, E), 0.0, 1.0), MaterialShininess) * LightSpecularColor.a;
      gl_FragColor += vec4(C * specularIntensity, MaterialSpecularColor.a * specularIntensity);
    }
  }
}
