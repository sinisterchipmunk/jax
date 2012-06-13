void mapToParaboloid(inout vec4 position, const float zNear, const float zFar) {
  float L = length(position.xyz);
  position /= L;
  position.z += 1.0;
  position.xy /= position.z;
  position.z = (L - zNear) / (zFar - zNear);
  position.w = 1.0;
}
