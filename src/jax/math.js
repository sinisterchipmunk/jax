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
