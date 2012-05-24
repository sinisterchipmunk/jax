shared uniform mat4 MVP;
shared attribute vec4 VERTEX_POSITION;

void main(void) {
  gl_Position = MVP * VERTEX_POSITION;
}
