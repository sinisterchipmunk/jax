shared uniform int PASS;
shared uniform float MaterialAmbientIntensity;
shared uniform vec4 MaterialAmbientColor;
shared uniform vec4 LightAmbientColor;

void main(void) {
  // no output on world ambient pass
  if (PASS != 0) {
    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb;
    vec4 color = vec4(LightAmbientColor.rgb * LightAmbientColor.a * material, MaterialAmbientColor.a);
    import(VertexColor, color *= VertexColor);
    gl_FragColor += color;
  }
}
