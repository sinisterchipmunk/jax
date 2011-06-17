vec4 pack_depth(const in float depth)
{
  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
  vec4 res = fract(depth * bit_shift);
  res -= res.xxyz * bit_mask;
  return res;
}

/*
float linearize(in float z) {
  float A = pMatrix[2].z, B = pMatrix[3].z;
  float n = - B / (1.0 - A); // camera z near
  float f =   B / (1.0 + A); // camera z far
  return (2.0 * n) / (f + n - z * (f - n));
}
*/

float unpack_depth(const in vec4 rgba_depth)
{
  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
  float depth = dot(rgba_depth, bit_shift);
  return depth;
}
