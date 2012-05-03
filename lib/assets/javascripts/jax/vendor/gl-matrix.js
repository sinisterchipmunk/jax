//= require "gl-matrix"

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

var vec4 = quat4;

/**
 * mat4.IDENTITY -> mat4
 *
 * Represents a 4x4 Identity matrix.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
mat4.IDENTITY = mat4.identity(mat4.create());

/**
 * quat4.IDENTITY -> quat4
 *
 * Represents the Identity quaternion.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.IDENTITY = quat4.create([0, 0, 0, 1]);

/**
 * vec3.UNIT_X -> vec3
 *
 * Represents a unit vector along the positive X axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_X = vec3.create([1,0,0]);

/**
 * vec3.UNIT_Y -> vec3
 *
 * Represents a unit vector along the positive Y axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_Y = vec3.create([0,1,0]);

/**
 * vec3.UNIT_Z -> vec3
 *
 * Represents a unit vector along the positive Z axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_Z = vec3.create([0,0,1]);
