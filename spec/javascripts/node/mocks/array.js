/*** WebGL types ***/
/* WebGL arrays with length are initialized to 0, Array initializes to undefined. Normalize. */
exports.array = (function(orig){
  var f = function() {
    var result = orig.apply(this, arguments);
    if (arguments.length == 1 && typeof(arguments[0]) == 'number')
      for (var i = 0; i < arguments[0]; i++)
        result[i] = 0;
    return result;
  };
  f.prototype = orig.prototype;
  return f;
})(Array);
