shared attribute vec4 VERTEX_POSITION;

void main(void) {
  if (PASS != 0) {
    for (int LIGHT = 0; LIGHT < MAX_LIGHTS; LIGHT++)
      if (SHADOWMAP_ENABLED[LIGHT])
        vShadowCoord[LIGHT] = SHADOWMAP_MATRIX[LIGHT] * mMatrix * VERTEX_POSITION;
  }
}
