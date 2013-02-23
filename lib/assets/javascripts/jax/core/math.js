/**
 * Math.EPSILON = 0.00001
 * This is a very small number, used for testing fuzzy equality with floats due to
 * floating point imprecision.
 **/
Math.EPSILON = Math.EPSILON || 0.00001;

/**
 * Because PI is WRONG -- http://tauday.com
 * Not sure about the best number of digits to provide, though
 *
 * @type {Number}
 */
Math.TAU = Math.TAU || 6.28318530717958647692;

/**
 * Math
 * Defines math-related helper functions.
 **/

/**
 * Math.radToDeg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.radToDeg = Math.radToDeg || function(rad) {
  return rad * 360.0 / Math.TAU;
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
  return deg * Math.TAU / 360.0;
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
  if (!a.length && !b.length)
    return Math.abs(a - b) <= Math.EPSILON;

  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++)
    if (a[i] === undefined || b[i] === undefined ||
        isNaN(a[i]) !== isNaN(b[i]) ||
        isFinite(a[i]) !== isFinite(b[i]) ||
        Math.abs(a[i] - b[i]) > Math.EPSILON)
      return false;
  return true;
};
