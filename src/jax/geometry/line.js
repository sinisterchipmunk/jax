Jax.Geometry.Line = (function() {
  var Line = Jax.Class.create({
    initialize: function(a, b) {
      this.a = vec3.create();
      this.b = vec3.create();
      
      if (arguments.length) this.set(a, b);
    },
    
    set: function(a, b) {
      vec3.set(a, this.a);
      vec3.set(b, this.b);
    },
    
    toString: function() {
      return "[Line a:"+this.a+", b:"+this.b+"]";
    }
  });
  
  // array-style accessors
  Object.defineProperty(Line.prototype, 0, {
    get: function() { return this.a; },
    set: function(v) { return this.a = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Line.prototype, 1, {
    get: function() { return this.b; },
    set: function(v) { return this.b = v; },
    enumerable: false,
    configurable: false
  });
  
  return Line;
})();
