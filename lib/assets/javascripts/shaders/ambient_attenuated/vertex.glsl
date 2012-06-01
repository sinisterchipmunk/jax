shared attribute vec4 VERTEX_POSITION;

void main(void) {
  vEyeSpaceSurfacePosition = (ModelViewMatrix * VERTEX_POSITION).xyz;
}
