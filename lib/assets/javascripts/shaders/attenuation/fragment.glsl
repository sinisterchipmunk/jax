shared uniform int PASS;
shared uniform float ConstantAttenuation;
shared uniform float LinearAttenuation;
shared uniform float QuadraticAttenuation;
shared uniform float LightRadius;
shared uniform float LightExtent;

void main(void) {
  if (PASS != 0) {
    cache(float, LightDistanceFromSurface) { LightDistanceFromSurface = 1.0; }
    gl_FragColor.rgb *= 1.0 / (ConstantAttenuation +
                               LinearAttenuation * LightDistanceFromSurface +
                               QuadraticAttenuation * pow(LightDistanceFromSurface, 2.0));
  }
}
