shared uniform int PASS;
shared uniform float MaterialAmbientIntensity;
shared uniform vec4 MaterialAmbientColor;
shared uniform vec4 LightAmbientColor;

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb * MaterialAmbientColor.a;
    gl_FragColor += vec4(LightAmbientColor.rgb * LightAmbientColor.a * material, 1.0);
  }
}
