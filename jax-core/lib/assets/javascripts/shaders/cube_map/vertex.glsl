shared attribute vec3 CVNORMAL, CVERTEX;

void main(void) {
  vCubeMapNormal = CNORMAL_MATRIX * normalize(normalize(CVERTEX) + CVNORMAL);
}
