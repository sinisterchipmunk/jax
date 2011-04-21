// If an epsilon isn't defined, define it. This is used for fuzzy equality with floats,
// because of floating point imprecision.
Math.EPSILON = Math.EPSILON || 0.00001;

/**
 * Math
 * Defines math-related helper functions.
 **/

/**
 * Math.radToDeg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.radToDeg = Math.radToDeg || function(rad) {
  return rad * 180.0 / Math.PI;
};

/**
 * Math.radToDeg(rad) -> Number
 * Helper to convert degrees to radians.
 **/
Math.degToRad = Math.degToRad || function(deg) {
  return deg * Math.PI / 180.0;
};

/**
 * Math.equalish(a, b) -> Boolean
 * Arguments can be either scalar or vector, but must be of the same type.
 * Returns true if the arguments are "equal enough" after accounting for floating-point
 * precision loss. Returns false otherwise.
 **/
Math.equalish = Math.equalish || function(a, b) {
  if (!a.length && !b.length)
    return Math.abs(a - b) <= Math.EPSILON;

  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++)
    if (Math.abs(a[i] - b[i]) > Math.EPSILON) return false;
  return true;
};
