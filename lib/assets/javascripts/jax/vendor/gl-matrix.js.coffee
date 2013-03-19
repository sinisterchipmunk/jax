#= require "gl-matrix"

vec2.equalish = (a, b) ->
  Math.abs(a[0] - b[0]) < Math.EPSILON &&
  Math.abs(a[1] - b[1]) < Math.EPSILON

vec3.equalish = (a, b) ->
  Math.abs(a[0] - b[0]) < Math.EPSILON &&
  Math.abs(a[1] - b[1]) < Math.EPSILON &&
  Math.abs(a[2] - b[2]) < Math.EPSILON

vec4.equalish = mat2.equalish = quat.equalish = (a, b) ->
  Math.abs(a[0] - b[0]) < Math.EPSILON &&
  Math.abs(a[1] - b[1]) < Math.EPSILON &&
  Math.abs(a[2] - b[2]) < Math.EPSILON &&
  Math.abs(a[3] - b[3]) < Math.EPSILON

mat2d.equalish = (a, b) ->
  Math.abs(a[0] - b[0]) < Math.EPSILON &&
  Math.abs(a[1] - b[1]) < Math.EPSILON &&
  Math.abs(a[2] - b[2]) < Math.EPSILON &&
  Math.abs(a[3] - b[3]) < Math.EPSILON &&
  Math.abs(a[4] - b[4]) < Math.EPSILON &&
  Math.abs(a[5] - b[5]) < Math.EPSILON

mat3.equalish = (a, b) ->
  Math.abs(a[0] - b[0]) < Math.EPSILON &&
  Math.abs(a[1] - b[1]) < Math.EPSILON &&
  Math.abs(a[2] - b[2]) < Math.EPSILON &&
  Math.abs(a[3] - b[3]) < Math.EPSILON &&
  Math.abs(a[4] - b[4]) < Math.EPSILON &&
  Math.abs(a[5] - b[5]) < Math.EPSILON &&
  Math.abs(a[6] - b[6]) < Math.EPSILON &&
  Math.abs(a[7] - b[7]) < Math.EPSILON &&
  Math.abs(a[8] - b[8]) < Math.EPSILON

mat4.equalish = (a, b) ->
  Math.abs(a[ 0] - b[ 0]) < Math.EPSILON &&
  Math.abs(a[ 1] - b[ 1]) < Math.EPSILON &&
  Math.abs(a[ 2] - b[ 2]) < Math.EPSILON &&
  Math.abs(a[ 3] - b[ 3]) < Math.EPSILON &&
  Math.abs(a[ 4] - b[ 4]) < Math.EPSILON &&
  Math.abs(a[ 5] - b[ 5]) < Math.EPSILON &&
  Math.abs(a[ 6] - b[ 6]) < Math.EPSILON &&
  Math.abs(a[ 7] - b[ 7]) < Math.EPSILON &&
  Math.abs(a[ 8] - b[ 8]) < Math.EPSILON &&
  Math.abs(a[ 9] - b[ 9]) < Math.EPSILON &&
  Math.abs(a[10] - b[10]) < Math.EPSILON &&
  Math.abs(a[11] - b[11]) < Math.EPSILON &&
  Math.abs(a[12] - b[12]) < Math.EPSILON &&
  Math.abs(a[13] - b[13]) < Math.EPSILON &&
  Math.abs(a[14] - b[14]) < Math.EPSILON &&
  Math.abs(a[15] - b[15]) < Math.EPSILON

###
mat4.IDENTITY -> mat4

Represents a 4x4 Identity matrix.

(Note: this is a Jax-specific extension. It does not appear by default
in the glMatrix library.)
###
mat4.IDENTITY = mat4.identity mat4.create()

###
quat4.IDENTITY -> quat4

Represents the Identity quaternion.

(Note: this is a Jax-specific extension. It does not appear by default
in the glMatrix library.)
###
quat.IDENTITY = quat.identity quat.create()

###
vec3.UNIT_X -> vec3

Represents a unit vector along the positive X axis

(Note: this is a Jax-specific extension. It does not appear by default
in the glMatrix library.)
###
vec3.UNIT_X = vec3.fromValues 1, 0, 0

###
vec3.UNIT_Y -> vec3

Represents a unit vector along the positive Y axis

(Note: this is a Jax-specific extension. It does not appear by default
in the glMatrix library.)
###
vec3.UNIT_Y = vec3.fromValues 0, 1, 0

###
vec3.UNIT_Z -> vec3

Represents a unit vector along the positive Z axis

(Note: this is a Jax-specific extension. It does not appear by default
in the glMatrix library.)
###
vec3.UNIT_Z = vec3.fromValues 0, 0, 1
