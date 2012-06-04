shared attribute vec4 VERTEX_POSITION;

void main(void) {
  if (PASS != 0) {
    vEyeSpaceSurfacePosition = (ModelViewMatrix * VERTEX_POSITION).xyz;
  }
}
