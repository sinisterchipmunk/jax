shared attribute vec4 VERTEX_POSITION;

shared uniform mat4 mvMatrix, pMatrix;

const float LOG2 = 1.442695;

void main(void) {
  vec4 pos = mvMatrix * VERTEX_POSITION;
  gl_Position = pMatrix * pos;
}
