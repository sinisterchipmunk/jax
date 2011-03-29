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
    for (var i in src) {
      if (src[i] == null) dst[i] = null;
      else if (typeof(src[i]) == "object") Jax.Util.merge(src[i], dst[i] = dst[i] || {});
      else dst[i] = src[i];
    }
    return dst;
  },
  
  /**
   * Jax.Util.normalizeOptions(incoming, defaults) -> Object
   * Receives incoming and formats it into a generic Object with a structure representing the given defaults.
   * The returned object is always a brand-new object, to avoid polluting original incoming object.
   **/
  normalizeOptions: function(incoming, defaults) {
    var result = {};
    Jax.Util.merge(defaults, result);
    Jax.Util.merge(incoming, result);
    return result;
  }
};
