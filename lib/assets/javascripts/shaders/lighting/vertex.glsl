shared attribute vec2 VERTEX_TEXCOORDS;
shared attribute vec3 VERTEX_NORMAL;
shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;

void main(void) {
  vLightDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));
}
