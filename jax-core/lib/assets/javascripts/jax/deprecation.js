((function() {
  function messageFor(owner, newProp, oldProp) {
    if (newProp) {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please use `"+owner.name+"#"+newProp.replace(/\./g, '#')+"` instead.";
    } else {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please see the documentation.";
    }
  }

  function createDelegator(oldProp, newProp, message) {
    var setter = false;
    if (newProp) {
      setter = newProp.charAt(newProp.length-1) === '=';
      newProp = newProp.replace(/=$/, '');
    }
    
    return (function() {
      var _value;
      var src = this;
      if (newProp) {
        var prop = newProp.split('.');
        while (prop.length > 1) {
          src = src[prop.shift()];
          if (src === undefined) throw new Error(message);
        }
        prop = prop[0]
        _value = src[prop]
        if (Jax.deprecate.level > 0) console.log(new Error(message).stack);
        else console.log(message);
        if (_value instanceof Function)
          return _value.apply(this, arguments);
        else {
          if (setter)
            if (arguments.length > 1)
              return src[prop] = arguments;
            else
              return src[prop] = arguments[0];
          else
            return _value;
        }
      } else {
        throw new Error(message);
      }
    });
  }

  Jax.deprecate = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    _proto[oldProp] = delegator;
  };

  Jax.deprecateProperty = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    Object.defineProperty(_proto, oldProp, {
      get: delegator,
      set: delegator
    });
  };
})());

Jax.deprecate.level = 1;

Jax.deprecate(Jax.Util, 'normalizeOptions', 'jQuery.extend',
    'Jax.Util.normalizeOptions has been deprecated in favor of jQuery.extend.');
