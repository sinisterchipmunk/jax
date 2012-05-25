shared attribute vec2 VERTEX_TEXCOORDS;
shared attribute vec3 VERTEX_NORMAL;
shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;

void main(void) {
  vNormal = nMatrix * VERTEX_NORMAL;
  vSurfacePos = (mvMatrix * VERTEX_POSITION).xyz;
  vLightDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));
}
