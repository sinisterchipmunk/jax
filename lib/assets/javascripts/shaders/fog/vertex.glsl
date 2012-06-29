shared attribute vec4 VERTEX_POSITION;

void main(void) {
  vDistance = (ModelViewProjectionMatrix * VERTEX_POSITION).z;
}
