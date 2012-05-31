shared uniform mat4 MV;
shared attribute vec4 VERTEX_COLOR, VERTEX_POSITION;
shared attribute vec3 VERTEX_NORMAL;

void main(void) {
  vEyeSpaceSurfaceNormal = VERTEX_NORMAL;
}
