//= require "jax/prototype/core"

/**
 * Jax.Class
 **/
Jax.Class = (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __slice = Array.prototype.slice;
  
  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 })
      if (p === 'toString') return false;
    return true;
  })();
  
  function addMethods(source, ancestor) {
    var ancestor   = ancestor && ancestor.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() {
            if (m === 'initialize' && !ancestor[m])
              return ancestor.constructor.apply(this, arguments);
            else {
              if (!ancestor[m]) throw new Error("ancestor has no method "+m);
              return ancestor[m].apply(this, arguments);
            }
          };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    Methods: {
      addMethods: addMethods
    },
    
    create: function() {
      var parent, properties;
      if (arguments.length > 1) {
        parent = arguments[0];
        properties = arguments[1];
      } else {
        parent = null;
        properties = arguments[0];
      }
      
      return (function(_super) {
        if (_super)
          __extends(Klass, _super);
        
        function Klass() {
          if (this.initialize)
            this.initialize.apply(this, arguments);
        }
        
        Object.extend(Klass, Jax.Class.Methods);
        Klass.addMethods(properties, _super);
        
        return Klass;
      })(parent);
    }
  };
  /*
  
  var emptyFunction = function() { };

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = Jax.$A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Jax.Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      if (parent.subclasses)
        parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
  */
})();
