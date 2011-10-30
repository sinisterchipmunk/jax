/**
 * mat3.multiplyVec3(matrix, vec[, dest]) -> vec3
 * - matrix (mat3): the 3x3 matrix to multiply against
 * - vec (vec3): the vector to multiply
 * - dest (vec3): an optional receiving vector. If not given, vec is used.
 *
 * Transforms the vec3 according to this rotation matrix. Returns +dest+.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
mat3.multiplyVec3 = function(matrix, vec, dest) {
  if (!dest) dest = vec;
  
  dest[0] = vec[0] * matrix[0] + vec[1] * matrix[3] + vec[2] * matrix[6];
  dest[1] = vec[0] * matrix[1] + vec[1] * matrix[4] + vec[2] * matrix[7];
  dest[2] = vec[0] * matrix[2] + vec[1] * matrix[5] + vec[2] * matrix[8];
  
  return dest;
};
