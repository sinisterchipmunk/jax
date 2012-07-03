shared uniform mat4 ModelViewProjectionMatrix;
shared attribute vec4 VERTEX_POSITION;

void main(void) {
  cache(vec4, VertexPosition) { VertexPosition = VERTEX_POSITION; }
  gl_Position = ModelViewProjectionMatrix * VertexPosition;
}
