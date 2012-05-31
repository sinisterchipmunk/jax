shared attribute vec4 VERTEX_COLOR, VERTEX_POSITION;
shared attribute vec3 VERTEX_NORMAL;

void main(void) {
  vEyeSpaceSurfaceNormal = NormalMatrix * VERTEX_NORMAL;
}
