shared uniform mat4 ModelViewProjectionMatrix;
shared attribute vec4 VERTEX_POSITION;

void main(void) {
  gl_Position = ModelViewProjectionMatrix * VERTEX_POSITION;
}
