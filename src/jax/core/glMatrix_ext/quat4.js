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
 * quat4.fromAngleAxis(angle, axis[, dest]) -> quat4
 * - angle (Number): the angle in radians
 * - axis (vec3): the axis around which to rotate
 * - dest (quat4): the optional quat4 to store the result in
 *
 * Creates a quat4 from the given angle and rotation axis,
 * then returns it. If dest is not given, a new quat4 is created.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
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
 * quat4.IDENTITY -> quat4
 *
 * Represents the Identity quaternion.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.IDENTITY = quat4.create([0, 0, 0, 1]);

