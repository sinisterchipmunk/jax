void main(void) {
  if (PASS == 0) {
    // ambient pass only
    gl_FragColor.rgb *= WorldAmbientColor.rgb * WorldAmbientColor.a * MaterialAmbientIntensity;
  }
}
