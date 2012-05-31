// Phong formula: Is = Sm x Sl x pow( max(R dot E, 0.0), f )
//   where Sl is the light specular color, Sm is the material specular color,
//     E is the view vector, and R is the reflected light vector.
//
// This shader holds alpha constant at 1.0 and is intended to be blended
// additively with a prior ambient pass.

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    vec3 N = normalize(vEyeSpaceSurfaceNormal);
    vec3 R = reflect(EyeSpaceLightDirection, N);
    vec3 C = MaterialSpecularColor.rgb * LightSpecularColor.rgb;
    vec3 E = normalize(vEyeSpaceSurfacePosition);
    gl_FragColor += vec4(C * MaterialSpecularIntensity * pow(max(dot(R, E), 0.0), MaterialShininess), 1.0);
  }
}
