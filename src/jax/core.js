//= require "vendor/ejs"
//= require "vendor/glMatrix"
//= require "prototype/class"
//= require "core/helper"
//= require "core/math"
//= require "core/util"
//= require "core/matrix_stack"

/**
 * Global#debugAssert(expr[, msg]) -> undefined
 * a global debugAssert method that will do nothing in production, and fail if expr is false
 * in any other run mode. If msg is given, an error with that message is raised. Otherwise,
 * a more generic error is raised.
 **/
window.debugAssert = function(expr, msg) {
  if (Jax.environment != Jax.PRODUCTION && !expr)
  {
    var error = new Error(msg || "debugAssert failed");
    if (error.stack) error = new Error((msg || "debugAssert failed")+"\n\n"+error.stack);
    throw error;
  }
};

// If glMatrixArrayType isn't simply Array, then most browsers (FF, Chrome) have a pretty
// crappy implementation of toString() that actually tells you nothing about the array's
// contents. This makes the #toString method a little more Array-like.
//
// Ex: "[Float32Array: -100,-100,-100]"
if (glMatrixArrayType.prototype.toString != Array.prototype.toString) {
  glMatrixArrayType.prototype.toString = function() {
    var s = "["+glMatrixArrayType.name+": ";
    var d = false;
    for (var i in this) {
      if (parseInt(i) == i) {
        if (d) s += ",";
        s += this[i];
        d = true;
      }
    }
    s += "]";
    return s;
  }
}
