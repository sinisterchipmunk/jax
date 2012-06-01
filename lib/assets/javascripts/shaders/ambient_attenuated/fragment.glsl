void main(void) {
  // no output on ambient pass
  if (PASS != 0) {
    gl_FragColor += vec4(LightAmbientColor.rgb * MaterialAmbientIntensity, 1.0);
  /*
    lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;
    float d = length(lightDirection);

    return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);
    */
  }
}
