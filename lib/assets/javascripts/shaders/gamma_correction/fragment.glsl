uniform float GammaCorrectionFactor;

void main(void) {
  if (GammaCorrectionFactor == 0.0) {
    // sRGB
    vec3 c = gl_FragColor.rgb;
    gl_FragColor.rgb = (step(0.0031308, c)*1.055*pow(c, vec3(1.0/2.4))-0.055) +
                       (step(-0.0031308, -c)*12.92*c);
  } else {
    gl_FragColor.rgb = pow(gl_FragColor.rgb,
                       vec3(GammaCorrectionFactor));
  }
}
