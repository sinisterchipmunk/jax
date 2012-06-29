shared attribute vec4 VERTEX_POSITION;

void main(void) {
  if (PASS != 0) {
    if (SHADOWMAP_ENABLED)
      vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;
  }
}
