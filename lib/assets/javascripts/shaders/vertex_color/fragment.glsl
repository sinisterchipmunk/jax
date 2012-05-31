void main(void) {
  if (PASS == 0) {
    float alpha = vColor.a * WorldAmbientColor.a;
  
    // ambient pass only
    gl_FragColor = export(vec4, COLOR, vec4(vColor.rgb * WorldAmbientColor.rgb * MaterialAmbientIntensity, alpha));
  }
}
