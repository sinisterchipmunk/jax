shared attribute vec4 VERTEX_POSITION;

void main(void) {
  bvec2 shouldRender = bvec2(PASS != 0, SHADOWMAP_ENABLED);
  if (all(shouldRender)) {
    vVertPos = VERTEX_POSITION;
    vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;
  }
}
