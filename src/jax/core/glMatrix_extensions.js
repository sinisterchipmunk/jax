/**
 * quat4.toAngleAxis(src[, dest]) -> vec4
 * - src (quat4): the quaternion to convert into an axis with angle
 * - dest (vec4): the optional destination vec4 to store the axis and angle in
 *
 * If dest is not given, src will be modified in place and returned.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.toAngleAxis = function(src, dest) {
  if (!dest) dest = src;
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

  var sqrlen = src[0]*src[0]+src[1]*src[1]+src[2]*src[2];
  if (sqrlen > 0)
  {
    dest[3] = 2 * Math.acos(src[3]);
    var invlen = Math.invsrt(sqrlen);
    dest[0] = src[0]*invlen;
    dest[1] = src[1]*invlen;
    dest[2] = src[2]*invlen;
  } else {
    // angle is 0 (mod 2*pi), so any axis will do
    dest[3] = 0;
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
  }
  
  return dest;
};

/**
 * vec3.toQuatRotation(first, second[, dest]) -> quat4
 * - first (vec3): the initial direction vector
 * - second (vec3): the direction to rotate to
 * - dest (quat4): optional quat4 containing result
 *
 * Returns the shortest arc rotation between the two vectors
 * in the form of a quaternion. If dest is not given, it is
 * created.
 **/
vec3.toQuatRotation = function(first, second, dest) {
  var dot = vec3.dot(first, second);
  // if dot == 1, vectors are the same
  if (dot >= 1.0) return quat4.IDENTITY;
  if (dot < (0.000001 - 1.0)) { // 180 degrees
    // generate an axis
    var axis = vec3.cross(vec3.UNIT_X, first, vec3.create());
    if (vec3.length(axis) < Math.EPSILON) // pick another if colinear
      axis = vec3.cross(vec3.UNIT_Y, first, axis);
    vec3.normalize(axis);
    return quat4.fromAngleAxis(Math.PI, axis, dest);
  } else {
    var s = Math.sqrt((1+dot)*2);
    var invs = 1 / s;
    var c = vec3.cross(first, second, vec3.create());
    if (!dest) dest = quat4.create();
    dest[0] = c[0] * invs;
    dest[1] = c[1] * invs;
    dest[2] = c[2] * invs;
    dest[3] = s * 0.5;
    return quat4.normalize(dest);
  }
};

/**
 * quat4.fromAngleAxis(angle, axis[, dest]) -> quat4
 * - angle (Number): the angle in radians
 * - axis (vec3): the axis around which to rotate
 * - dest (quat4): the optional quat4 to store the result in
 *
 * Creates a quat4 from the given angle and rotation axis,
 * then returns it. If dest is not given, a new quat4 is created.
 **/
quat4.fromAngleAxis = function(angle, axis, dest) {
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
  if (!dest) dest = quat4.create();
  
  var half = angle * 0.5;
  var s = Math.sin(half);
  dest[3] = Math.cos(half);
  dest[0] = s * axis[0];
  dest[1] = s * axis[1];
  dest[2] = s * axis[2];
  
  return dest;
};

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
