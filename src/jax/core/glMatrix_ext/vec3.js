/**
 * vec3.toQuatRotation(first, second[, dest]) -> quat4
 * - first (vec3): the initial direction vector
 * - second (vec3): the direction to rotate to
 * - dest (quat4): optional quat4 containing result
 *
 * Returns the shortest arc rotation between the two vectors
 * in the form of a quaternion. If dest is not given, it is
 * created.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
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
