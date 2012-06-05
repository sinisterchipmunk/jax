shared uniform int PASS;
shared uniform float MaterialAmbientIntensity;
shared uniform vec4 LightAmbientColor;

void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    gl_FragColor += vec4(LightAmbientColor.rgb * MaterialAmbientIntensity, 1.0);
  }
}
