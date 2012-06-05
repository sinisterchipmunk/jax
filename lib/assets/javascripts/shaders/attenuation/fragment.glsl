shared uniform int PASS;
shared uniform float ConstantAttenuation;
shared uniform float LinearAttenuation;
shared uniform float QuadraticAttenuation;
shared uniform float LightRadius;
shared uniform float LightExtent;

void main(void) {
  if (PASS != 0) {
    float dist = import(LightDistanceFromSurface, 1.0);
    if (dist > 0.0)
      gl_FragColor.rgb *= 1.0 / (ConstantAttenuation +
                                 LinearAttenuation * dist +
                                 QuadraticAttenuation * pow(dist, 2.0));
  }
}
