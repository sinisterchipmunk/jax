shared attribute vec4 VERTEX_COLOR, VERTEX_POSITION;
shared attribute vec3 VERTEX_NORMAL;

void main(void) {
  if (PASS != 0) {
    /* These variables are cached so that other shaders can replace their values */
    cache(vec3, VertexNormal) { VertexNormal = VERTEX_NORMAL; }
    cache(vec4, VertexPosition) { VertexPosition = VERTEX_POSITION; }
    /* exports can also be used to modify the normal */
    vec3 normal = VertexNormal;
    import(VertexNormal, normal = normalize(normal + VertexNormal));
    vEyeSpaceSurfaceNormal = NormalMatrix * normal;
    vEyeSpaceSurfacePosition = (ModelViewMatrix * VertexPosition).xyz;
  }
}
