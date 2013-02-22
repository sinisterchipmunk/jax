/**
 * Math.EPSILON = 0.00001
 * This is a very small number, used for testing fuzzy equality with floats due to
 * floating point imprecision.
 **/
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

/** alias of: Math.radToDeg
 * Math.rad2deg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.rad2deg = Math.rad2deg || Math.radToDeg;

/**
 * Math.degToRad(deg) -> Number
 * Helper to convert degrees to radians.
 **/
Math.degToRad = Math.degToRad || function(deg) {
  return deg * Math.PI / 180.0;
};

/** alias of: Math.degToRad
 * Math.deg2rad(deg) -> Number
 * Helper to convert degrees to radians.
 **/
Math.deg2rad = Math.deg2rad || Math.degToRad;

/**
 * Math.equalish(a, b) -> Boolean
 * Arguments can be either scalar or vector, but must be of the same type.
 * Returns true if the arguments are "equal enough" after accounting for floating-point
 * precision loss. Returns false otherwise.
 *
 * Also returns false if any element of either vector is undefined.
 **/
Math.equalish = Math.equalish || function(a, b) {
  var ta = typeof(a), tb = typeof(b);
  if (ta === 'number' && tb === 'number')
    return Math.abs(a - b) <= Math.EPSILON;

  if (ta !== tb) return false;
  if (ta.length !== tb.length) return false;
  
  for (var i = 0; i < a.length; i++)
    if (a[i] === undefined || b[i] === undefined ||
        isNaN(a[i]) !== isNaN(b[i]) ||
        isFinite(a[i]) !== isFinite(b[i]) ||
        Math.abs(a[i] - b[i]) > Math.EPSILON)
      return false;
  return true;
};
