/**
 * class Jax.Geometry.Line
 *
 **/
Jax.Geometry.Line = (function() {
  var bufs = {};
  
  var Line = Jax.Class.create({
    /**
     * new Jax.Geometry.Line([a[, b]])
     * - a (vec3): point A (optional)
     * - b (vec3): point B (optional)
     *
     * Creates a new line. If point A and B are given, they are
     * passed into #set to initialize the line. If they are not
     * given, all values default to 0.
     **/
    initialize: function(a, b) {
      /**
       * Jax.Geometry.Line#a -> vec3
       *
       * the starting point of this line
       **/

      this.a = GLMatrix.vec3.create();

      /**
       * Jax.Geometry.Line#b -> vec3
       *
       * the ending point of this line
       **/
      this.b = GLMatrix.vec3.create();

      /**
       * Jax.Geometry.Line#normal -> vec3
       *
       * the normal for this line, pointing from A towards B.
       **/
      this.normal = GLMatrix.vec3.create();

      /**
       * Jax.Geometry.Line#length -> Number
       *
       * the length of this line
       **/
      this.length = 0;
      
      if (arguments.length) this.set(a, b);
    },
    
    /**
     * Jax.Geometry.Line#set(a, b) -> Jax.Geometry.Line
     * - a (vec3): point A
     * - b (vec3): point B
     *
     * Sets this line to span from point A to point B.
     * Also recalculates the length and normal for this line.
     **/
    set: function(a, b) {
      GLMatrix.vec3.copy(this.a, a);
      GLMatrix.vec3.copy(this.b, b);
      
      GLMatrix.vec3.subtract(this.normal, b, a);
      this.length = GLMatrix.vec3.length(this.normal);
      GLMatrix.vec3.normalize(this.normal, this.normal);
      
      return this;
    },
    
    /**
     * Jax.Geometry.Line#contains(point) -> Boolean
     * - point (vec3): a 3D point
     *
     * Tests and returns whether this line contains the specified point.
     **/
    contains: function(point) {
      // check whether the normal from A to B is the same as the normal from A to P,
      // and whether the normal from B to A is the same as the normal from B to P.
      // There's probably a more efficient way to do this...
      
      var ba = vec3.subtract(this.b, this.a, bufs.ba || (bufs.ba = vec3.create()));
      var pa = vec3.subtract(point,  this.a, bufs.ba || (bufs.pa = vec3.create()));
      var ab = vec3.subtract(this.a, this.b, bufs.ba || (bufs.ab = vec3.create()));
      var pb = vec3.subtract(point,  this.b, bufs.ba || (bufs.pb = vec3.create()));
      
      vec3.normalize(ba);
      vec3.normalize(pa);
      vec3.normalize(ab);
      vec3.normalize(pb);
      
      return Math.equalish(ba, pa) && Math.equalish(ab, pb);
    },
    
    /**
     * Jax.Geometry.Line#intersectLineSegment(line[, dest]) -> Boolean
     * - line (Jax.Geometry.Line): the line to test for intersection
     * - dest (Jax.Geometry.Line | vec3): an optional receiver
     *
     * Tests the two lines for intersection. If +dest+ is given, the overlap is stored
     * within it. (If the lines intersect at a single point, but do not overlap, then
     * only the A point in +dest+ will be set.) If +dest+ is
     * omitted, this information is ignored. If +dest+ is a vec3, it will hold the center
     * of the intersection line.
     *
     * If the lines do not interesct, Jax.Geometry.DISJOINT (which is equal to 0) is returned.
     * If they intersect in a single unique point, Jax.Geometry.INTERSECT is returned.
     * If they intersect in a sub-segment, Jax.Geometry.COINCIDE is returned.
     **/
    intersectLineSegment: function(line, dest) {
      var u = vec3.subtract(this.b, this.a, vec3.create());
      var v = vec3.subtract(line.b, line.a, vec3.create());
      var w = vec3.subtract(this.a, line.a, vec3.create());
      var D = (u[0] * v[1] - u[1] * v[0]);
      var isVec3 = dest && !(dest instanceof Jax.Geometry.Line);
      if (Math.abs(D) < Math.EPSILON) { // S1 and S2 are parallel
        if ((u[0] * w[1] - u[1] * w[0]) != 0 || (v[0] * w[1] - v[1] * w[0]) != 0) {
          return Jax.Geometry.DISJOINT; // they are NOT colinear
        }
        // they are colinear or degenerate
        // check if they are degenerate points
        var du = vec3.dot(u, u);
        var dv = vec3.dot(v, v);
        if (du == 0 && dv == 0) { // both segments are points
          if (!Math.equalish(this.a, line.a)) // they are distinct points
            return Jax.Geometry.DISJOINT;
          // they are the same point
          if (dest)
            if (isVec3) vec3.set(line.a, dest);
            else vec3.set(line.a, dest.a);
          // vec3.set(line.a, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (du == 0) { // +this+ is a single point
          if (!line.contains(this.a)) // but is not in S2
            return Jax.Geometry.DISJOINT;
          if (dest)
            if (isVec3) vec3.set(this.a, dest);
            else vec3.set(this.a, dest.a);
          // vec3.set(this.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (dv == 0) { // +line+ is a single point
          if (!this.contains(line.a)) // but is not in this line
            return Jax.Geometry.DISJOINT;
          if (dest)
            if (isVec3) vec3.set(line.a, dest);
            else vec3.set(line.a, dest.a);
          // vec3.set(line.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        // they are colinear segments - get overlap (or not)
        var t0, t1; // endpoints of +this+ in eqn for +line+
        var w2 = vec3.subtract(this.a, line.a, vec3.create());
        if (v[0] != 0) {
          t0 = w[0] / v[0];
          t1 = w2[0] / v[0];
        } else {
          t0 = w[1] / v[1];
          t1 = w2[1] / v[1];
        }
        if (t0 > t1) { // must have t0 smaller than t1
          var t = t0; t0 = t1; t1 = t;
        }
        if (t0 > 1 || t1 < 0) // NO overlap
          return Jax.Geometry.DISJOINT;
        t0 = t0 < 0 ? 0 : t0; // clamp to min 0
        t1 = t1 > 1 ? 1 : t1; // clamp to max 1
        if (t0 == t1) {
          // intersect is a point
          if (line) {
            if (dest) {
              var dest_a = isVec3 ? dest : dest.a;
              vec3.add(line.a, vec3.scale(v, t0, dest_a), dest_a);
            }
            return Jax.Geometry.INTERSECT;
          }
        }
          
        // they overlap in a valid subsegment
        if (dest) {
          if (isVec3) {
            var tmp = bufs.tmp || (bufs.tmp = vec3.create());
            vec3.add(line.a, vec3.scale(v, t0, dest), dest);
            vec3.add(line.b, vec3.scale(v, t1, tmp),  dest);
            vec3.scale(dest, 0.5, dest);
          } else {
            vec3.add(line.a, vec3.scale(v, t0, dest.a), dest);
            vec3.add(line.b, vec3.scale(v, t1, dest.b), dest);
          }
        }
        return Jax.Geometry.COINCIDENT;
      }
      
      // the segments are askew and may intersect in a point
      // get the intersect parameter for +this+
      var sI = (v[0] * w[1] - v[1] * w[0]) / D;
      if (sI < 0 || sI > 1) // no intersect with +this+
        return Jax.Geometry.DISJOINT;
      // get the intersect parameter for +line+
      var tI = (u[0] * w[1] - u[1] * w[0]) / D;
      if (tI < 0 || tI > 1) // no intersect with +line+
        return Jax.Geometry.DISJOINT;
        
      if (dest) vec3.add(this.a, vec3.scale(u, sI, dest), dest);
      return Jax.Geometry.INTERSECT;
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
