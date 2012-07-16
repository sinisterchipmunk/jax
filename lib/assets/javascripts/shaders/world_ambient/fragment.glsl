void main(void) {
  if (PASS == 0) {
    // ambient pass only
    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb * MaterialAmbientColor.a;
    gl_FragColor.rgb *= WorldAmbientColor.rgb * WorldAmbientColor.a * material;
  }
}
