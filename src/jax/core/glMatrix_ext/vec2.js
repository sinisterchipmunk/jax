/**
 * class vec2
 * 
 * A 2D vector.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
if (typeof(vec2) == 'undefined') var vec2 = {};

/**
 * vec2.create([vec]) -> vec2
 * - vec (vec2): optional vec2 to initialize from
 * 
 * Creates a 2D vector and returns it.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec2.create = function(src) {
  var vec = new glMatrixArrayType(2);
  if (src) { vec[0] = src[0]; vec[1] = src[1]; }
  return vec;
};

