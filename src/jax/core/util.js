/**
 * Jax.Util
 * Contains general-purpose utility and helper functions
 **/
Jax.Util = {
  /**
   * Jax.Util.merge(incoming, outgoing) -> outgoing
   * Merges the two objects by copying all properties from _incoming_ into _outgoing_, replacing
   * any properties that already exist. _outgoing_ will retain any properties that do not exist
   * in _incoming_.
   **/
  merge: function(src, dst) {
    if (!src) return;
    var i;

    function doComparison(i) {
      if (src[i] == null) dst[i] = null;
      else if (src[i].klass)               dst[i] = src[i];
      else if (Object.isArray(src[i]))     Jax.Util.merge(src[i], dst[i] = dst[i] || []);
      else if (typeof(src[i]) == "object") Jax.Util.merge(src[i], dst[i] = dst[i] || {});
      else dst[i] = src[i];
    }
    
    if (Object.isArray(src)) for (i = 0; i < src.length; i++) doComparison(i);
    else for (i in src) doComparison(i);

    return dst;
  },
  
  /**
   * Jax.Util.normalizeOptions(incoming, defaults) -> Object
   * Receives incoming and formats it into a generic Object with a structure representing the given defaults.
   * The returned object is always a brand-new object, to avoid polluting original incoming object.
   * If the object contains a Jax.Class instance, that actual object is copied over. All other objects
   * are cloned into brand-new objects.
   **/
  normalizeOptions: function(incoming, defaults) {
    var result = {};
    Jax.Util.merge(defaults, result);
    Jax.Util.merge(incoming, result);
    return result;
  },

  /**
   * Jax.Util.sizeofFormat(glEnum) -> Number
   * 
   * Returns the byte size of an array consisting of this type of element.
   * 
   * Example:
   * 
   *     Jax.Util.sizeofFormat(GL_RGB)
   *     //=> 3
   *
   * If this isn't a recognized format, it is passed off to Jax.Util.enumName and an error is thrown. 
   **/
  sizeofFormat: function(glEnum) {
    switch(glEnum) {
      case GL_ALPHA: return 1;           // alpha component only
      case GL_LUMINANCE: return 1;       // luminance component only
      case GL_RGB: return 3;             // RGB triplet
      case GL_RGBA: return 4;            // all 4 components
      case GL_LUMINANCE_ALPHA: return 2; // luminance/alpha pair
    }
    throw new Error("Unrecognized format: "+Jax.Util.enumName(glEnum));
  },

  /**
   * Jax.Util.enumName(glEnum) -> String
   * - glEnum (GLenum): a WebGL enumeration, presumably numeric.
   * 
   * Returns the name of the enumeration prefixed with "GL_" that shares a value with the passed-in enum.
   * 
   * If the enum can't be found (this happens sometimes when an enum crops up that isn't in the WebGL spec),
   * then a string containing both the decimal and hexadecimal form of this enum is returned:
   * 
   *     "(unrecognized enum: 36059 [0x8cdb])"
   * 
   * This is primarily for debugging and error reporting.
   **/
  enumName: function(glEnum) {
    for (var i in window) {
      if (i.indexOf("GL_") == 0 && window[i] == glEnum)
        return i;
    }
    return "(unrecognized enum: "+glEnum+" [0x"+parseInt(glEnum).toString(16)+"])";
  }
};
