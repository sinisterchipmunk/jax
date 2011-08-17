/**
 * quat4.fromAxes(view, right, up[, dest]) -> quat4
 * - view (vec3): the view vector
 * - right (vec3): the right vector
 * - up (vec3): the up vector
 * - dest (quat): an optional receiving quat4. If omitted, a new one is created.
 *
 * Creates a quaternion from the 3 given vectors. They must be perpendicular
 * to one another.
 **/
quat4.fromAxes = function(view, right, up, dest) {
  var mat = quat4.fromAxes.mat = quat4.fromAxes.mat || mat3.create();
  
  mat[0] = right[0];
  mat[3] = right[1];
  mat[6] = right[2];

  mat[1] = up[0];
  mat[4] = up[1];
  mat[7] = up[2];

  mat[2] = view[0];
  mat[5] = view[1];
  mat[8] = view[2];

  quat4.fromRotationMatrix(mat, dest);
};

/**
 * quat4.fromRotationMatrix(mat[, dest]) -> quat4
 * - mat (mat3): a 3x3 rotation matrix
 * - dest (quat4): an optional receiving quat4. If omitted, a new one is created.
 *
 * Creates a quaternion from the given rotation matrix.
 **/
quat4.fromRotationMatrix = function(mat, dest) {
  if (!dest) dest = quat4.create();
  
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".

  var fTrace = mat[0] + mat[4] + mat[8];
  var fRoot;

  if ( fTrace > 0.0 )
  {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0);  // 2w
    dest[3] = 0.5 * fRoot;
    fRoot = 0.5/fRoot;  // 1/(4w)
    dest[0] = (mat[7]-mat[5])*fRoot;
    dest[1] = (mat[2]-mat[6])*fRoot;
    dest[2] = (mat[3]-mat[1])*fRoot;
  }
  else
  {
    // |w| <= 1/2
    var s_iNext = quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1,2,0];
    var i = 0;
    if ( mat[4] > mat[0] )
      i = 1;
    if ( mat[8] > mat[i*3+i] )
      i = 2;
    var j = s_iNext[i];
    var k = s_iNext[j];
    
    fRoot = Math.sqrt(mat[i*3+i]-mat[j*3+j]-mat[k*3+k] + 1.0);
    dest[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    dest[3] = (mat[k*3+j] - mat[j*3+k]) * fRoot;
    dest[j] = (mat[j*3+i] + mat[i*3+j]) * fRoot;
    dest[k] = (mat[k*3+i] + mat[i*3+k]) * fRoot;
  }
    
  return dest;
};

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

