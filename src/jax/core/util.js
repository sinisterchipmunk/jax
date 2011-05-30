/**
 * class Array
 * A standard JavaScript array.
 **/

/**
 * Jax.Util
 * Contains general-purpose utility and helper functions
 **/
Jax.Util = {
  /**
   * Jax.Util.decodePickingColor(red, green, blue, alpha) -> Number
   * 
   * Performs the reverse of the 'picking' shader by restoring a number
   * that was previously encoded into the four color channels.
   **/
  decodePickingColor: function(red, green, blue, alpha) {
    /* blue is a key. It is always max. So if it's 1, we're dealing with floats; else, bytes. */
    if (blue == 1.0) {
      red *= 255;
      green *= 255;
    }
    return red * 256 + green;
  },

  /**
   * Jax.Util.vectorize(object) -> vec3
   * - object (Object): any Object
   *
   * Analyzes the input object and returns a vec3 based on its contents. Input can be any of the following:
   *   * a vec3
   *   * an array
   *   * an object with {x, y, z} properties
   *   * an object with {0, 1, 2} properties
   *   * a string delimited with any combination of commas, spaces and/or tab characters. Examples:
   *     "x,y,z"
   *     "x y z"
   *     "x, y, z"
   *     "x\ty\tz"
   *     "x, \ty, \tz"
   **/
  vectorize: function(data) {
    if (data) {
      var res = vec3.create();
      if (typeof(data) == "string") {
        var components = data.split(/[,\s]+/);
        if (components.length >= 3) {
          for (var i = 0; i < 3; i++)
            res[i] = parseFloat(components[i]);
        }
        return res;
      }
      if (data.length && data.length >= 3) return vec3.set(data, res);
      if ((res[0] = data.x) != undefined && (res[1] = data.y) != undefined && (res[2] = data.z) != undefined) return res;
      if ((res[0] = data[0]) != undefined && (res[1] = data[1]) != undefined && (res[2] = data[2]) != undefined) return res;
    }
    throw new Error("Input argument for Jax.Util.vectorize not recognized: "+JSON.stringify(data));
  },

  /**
   * Jax.Util.colorize(object) -> vec4
   * - object (Object): any Object
   *
   * Analyzes the input object and returns a 4-component color vector based on its contents. Input can be any of the
   * following:
   *   * an array
   *   * an object with {r, g, b, a} properties
   *   * an object with {0, 1, 2, 3} properties
   *   * a string delimited with any combination of commas, spaces and/or tab characters. Examples:
   *     "r,g,b,a"
   *     "r g b a" 
   *     "r, g, b, a"
   *     "r\tg\tb\ta"
   *     "r, \tg, \tb, \ta"
   *     
   * In all cases, if the alpha component is omitted, it defaults to 1.0.
   **/
  colorize: function(data) {
    if (data) {
      var res = [0,0,0,0];

      if (typeof(data) == "string") {
        var components = data.split(/[,\s]+/);
        if (components.length >= 3) {
          for (var i = 0; i < 4; i++)
            if (components.length <= i)
              res[i] = 1.0;
            else
              res[i] = parseFloat(components[i]);
        }
        return res;
      }
      if (data.length && data.length >= 3) {
        res[0] = data[0];
        res[1] = data[1];
        res[2] = data[2];
        if ((res[3] = data[3]) == undefined) res[3] = 1.0;
        else res[3] = 1.0;
        return res;
      }
      if ((res[0] = data.r) != undefined && (res[1] = data.g) != undefined && (res[2] = data.b) != undefined) {
        if ((res[3] = data.a) == undefined) res[3] = 1.0;
        return res;
      }
      if ((res[0] = data.red) != undefined && (res[1] = data.green) != undefined && (res[2] = data.blue) != undefined) {
        if ((res[3] = data.alpha) == undefined) res[3] = 1.0;
        return res;
      }
      if ((res[0] = data[0]) != undefined && (res[1] = data[1]) != undefined && (res[2] = data[2]) != undefined) {
        if ((res[3] = data[3]) == undefined) res[3] = 1.0;
        return res;
      }
    }
    throw new Error("Input argument for Jax.Util.colorize not recognized: "+JSON.stringify(data));
  },
  
  /**
   * Jax.Util.properties(object) -> Array
   * - object (Object): any Object
   * 
   * Returns an array containing the names of all properties in the specified object.
   **/
  properties: function(object) {
    var arr = [];
    for (var i in object)
      arr.push(i);
    return arr;
  },
  
  /**
   * Jax.Util.merge(incoming, outgoing) -> outgoing
   * Merges the two objects by copying all properties from _incoming_ into _outgoing_, replacing
   * any properties that already exist. _outgoing_ will retain any properties that do not exist
   * in _incoming_.
   **/
  merge: function(src, dst) {
    if (!src) return;
    var i, j, n;

    function doComparison(i) {
      if (src[i] == null) dst[i] = null;
      else if (src[i].klass)           dst[i] = src[i];
      else if (Object.isArray(src[i])) Jax.Util.merge(src[i], dst[i] = dst[i] || []);
      else if (typeof(src[i]) == "object") {
        if (Object.isArray(dst[i])) {
          n = {};
          for (j = 0; j < dst[i].length; j++) n[j] = dst[i][j];
          dst[i] = n;
        }
        Jax.Util.merge(src[i], dst[i] = dst[i] || {});
      }
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
  },

  /**
   * Jax.Util.addRequestedHelpers(klass) -> Array
   * - klass (Jax.Class): A class into which to mix the helpers.
   *
   * First, if +ApplicationHelper+ is defined, it is automatically mixed into the specified class.
   *
   * Then, the class is searched for a #helpers method; if it exists, it is expected to return an array of
   * Helpers (created with +Jax.Helper.create({...})+ ). Each element in the array returned by #helpers is
   * then mixed into the class.
   *
   * An array of all helpers that were just mixed into the target class is returned.
   **/
  addRequestedHelpers: function(klass) {
    var helpers = [];
    if (typeof(ApplicationHelper) != "undefined") {
      helpers.push(ApplicationHelper);
      klass.addMethods(ApplicationHelper);
    }
    if (klass.prototype.helpers) {
      var helper_array = klass.prototype.helpers.call(klass);
      for (var i = 0; i < helper_array.length; i++) {
        helpers.push(helper_array[i]);
        klass.addMethods(helper_array[i]);
      }
    }
    return helpers;
  }
};
