/**
 * class Array
 * A standard JavaScript array.
 **/

/**
 * Jax.Util
 * Contains general-purpose utility and helper functions
 **/
Jax.Util = {
  crc: function(s/*, polynomial = 0x04C11DB7, initialValue = 0xFFFFFFFF, finalXORValue = 0xFFFFFFFF*/) {
    s = String(s);
    var polynomial = arguments.length < 2 ? 0x04C11DB7 : arguments[1],
        initialValue = arguments.length < 3 ? 0xFFFFFFFF : arguments[2],
        finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : arguments[3],
        crc = initialValue,
        table = [], i, j, c;
   
    function reverse(x, n) {
      var b = 0;
      while (n) {
        b = b * 2 + x % 2;
        x /= 2;
        x -= x % 1;
        n--;
      }
      return b;
    }
   
    for (i = 255; i >= 0; i--) {
      c = reverse(i, 32);
   
      for (j = 0; j < 8; j++) {
        c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0;
      }
   
      table[i] = reverse(c, 32);
    }
   
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c > 255) {
        throw new RangeError();
      }
      j = (crc % 256) ^ c;
      crc = ((crc / 256) ^ table[j]) >>> 0;
    }
   
    return (crc ^ finalXORValue) >>> 0;
  },

  isPowerOfTwo: function(s) {
    return s && (s & -s) == s;
  },

  findMaterial: function(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance instanceof Jax.Material)
      return name_or_instance;

    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  },
  
  // Produces a hash code for the given input string.
  hash: function(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },
  
  scan: function(str, end, incr, decr, startIndex, singleLineComment, multiLineCommentStart, multiLineCommentEnd) {
    end = end || ')';
    incr = incr || '(';
    decr = decr || end;
    singleLineComment = singleLineComment || "//";
    multiLineCommentStart = multiLineCommentStart || "/*";
    multiLineCommentEnd   = multiLineCommentEnd   || "*/";
    
    startIndex = startIndex || 0;
    var depth = 0;
    var result = "";
    var inComment = 0;
    for (var i = startIndex; i < str.length; i++) {
      var ch = str[i];
      switch(ch) {
        case incr: if (!inComment) depth++; break;
        case decr: if (!inComment) depth--; break;
      }
      if (depth < 0) break;
      result += ch;
      
      if (result.length >= singleLineComment.length &&
          result.substring(result.length - singleLineComment.length, result.length) === singleLineComment)
        inComment = 1;
      if (inComment === 1 && ch === "\n")
        inComment = 0;
      if (!inComment && result.length >= multiLineCommentStart.length &&
          result.substring(result.length - multiLineCommentStart.length, result.length) === multiLineCommentStart)
        inComment = 2;
      if (inComment === 2 && result.length >= multiLineCommentEnd.length &&
          result.substring(result.length - multiLineCommentEnd.length, result.length) === multiLineCommentEnd)
        inComment = 0;
    }
    return result;
  },
  
  /**
   * Jax.Util.underscore(word) -> String
   * word (String): a String to be converted to underscore.
   *
   * Takes a String, which may be in CamelCase format, and returns
   * the same string converted to underscored_format. Examples:
   *
   *     "HelloWorld" => "hello_world"
   *     "Hello_World" => "hello_world"
   *     "Hello" => "hello"
   *
   **/
  underscore: function(word) {
    word = word.replace(/::/g, "\/");
    word = word.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
    word = word.replace(/([a-z\d])([A-Z])/g, '$1_$2');
    word = word.replace(/-/g, '_');
    return word.toLowerCase();
  },
  
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
      var res = [];//vec3.create();
      if (typeof(data) == "string") {
        var components = data.split(/[,\s]+/);
        if (components.length >= 2) {
          for (var i = 0; i < components.length; i++)
            res[i] = parseFloat(components[i]);
        }
        return res;
      }
      if (data.length && data.length >= 3) return vec3.copy(res, data);
      else if (data.length == 2) return [data[0], data[1]];
      if ((res[0] = data.x) != undefined && (res[1] = data.y) != undefined) {
        if (data.z != undefined) res[2] = data.z;
        return res;
      }
      if ((res[0] = data[0]) != undefined && (res[1] = data[1]) != undefined) {
        if (data[2] != undefined) res[2] = data[2];
        return res;
      }
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
      var res = vec4.create();

      if (data instanceof Jax.Color) {
        return vec4.copy(res, data.toVec4());
      }
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
    if (!src) return dst;
    return jQuery.extend(true, dst, src);
  },

  /**
   * Jax.Util.trim_duplicates(array) -> trimmed_array
   * Returns an array containing the elements of passed array, but without any duplicates
   * todo : add "dest" param (vec3 style)
   *
   * @param {Array} array with duplicates
   * @return {Array}
   */
  trimDuplicates: function(array) {
    var contains, item, results, i, len;
    results = [];
    contains = function(haystack, needle) {
      var match, straw, value, i, j, hLen, nLen;
      for (i = 0, hLen = haystack.length; i < hLen; i++) {
        straw = haystack[i];
        match = true;
        for (j = 0, nLen = needle.length; j < nLen; j++) {
          value = needle[j];
          if (straw[j] !== value) {
            match = false;
          }
        }
        if (match) {
          return true;
        }
      }
      return false;
    };

    for (i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (!contains(results, item)) {
        results.push(item);
      }
    }

    return results;
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
    var global = Jax.getGlobal();
    for (var i in global) {
      if (i.indexOf("GL_") == 0 && global[i] == glEnum)
        return i;
    }
    return "(unrecognized enum: "+glEnum+" [0x"+parseInt(glEnum).toString(16)+"])";
  }
};
