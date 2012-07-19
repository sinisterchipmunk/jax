void main(void) {
  if (PASS == 0) {
    // ambient pass only
    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb * MaterialAmbientColor.a;
    vec4 color = vec4(WorldAmbientColor.rgb * WorldAmbientColor.a * material, 1.0);
    import(VertexColor, color *= VertexColor);
	gl_FragColor = color;
  }
}
