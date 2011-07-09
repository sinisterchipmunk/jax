/**
 * class vec4
 * 
 * A 4D vector.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
if (typeof(vec4) == 'undefined') var vec4 = {};

/**
 * vec4.create([src]) -> vec4
 * - src (vec4 | Array): an optional source array to initialize this vec4 from
 * 
 * Creates and returns a new vec4, optionally initialized with values from +src+.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec4.create = function(src) {
  var dest = new glMatrixArrayType(4);
  if (src) {
    dest[0] = src[0];
    dest[1] = src[1];
    dest[2] = src[2];
  }
  return dest;
};
