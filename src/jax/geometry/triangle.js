//= require_self

/* faster than capturing intersection point when we don't care about it */
//= require "jax/geometry/triangle/tri_tri_intersect_optimized"

/**
 * class Jax.Geometry.Triangle
 *
 * A class for storing and manipulating a group of vertices in the form
 * of a triangle.
 **/
Jax.Geometry.Triangle = (function() {
  var bufs = {};
  
  // Although slower than 'tri_tri_intersect', this implementation
  // will find and store the exact point of intersection.

  // t1, t2: a triangle
  // dest: a vec3 to contain intersection point
  // If the return value is false, the value of dest will be unknown.
  function slow_tri_tri_intersect(t1, t2, dest)
  {
    var line1 = bufs.slowtri_line1 = bufs.slowtri_line1 || new Jax.Geometry.Line();
    var line2 = bufs.slowtri_line2 = bufs.slowtri_line2 || new Jax.Geometry.Line();
    if (t1.plane.intersectTriangle(t2, line1) && t2.plane.intersectTriangle(t1, line2)) {
      line1.intersectLineSegment(line2, dest);
      return true;
    }
    else return false;
  }
  
  var Triangle = Jax.Class.create({
    /**
     * new Jax.Geometry.Triangle(v1, v2, v3)
     * - v1 (vec3): the first vertex. Optional.
     * - v2 (vec3): the second vertex. Optional.
     * - v3 (vec3): the third vertex. Optional.
     *
     * Constructs a new triangle. Note that the vertices should
     * be wound in a counter-clockwise direction to produce proper
     * normals.
     *
     * Note: all arguments are optional for reasons of flexibility,
     * but constructing a triangle with no vertices will be effectively
     * useless (and its behavior undefined) until you subsequently call 
     * +set(v1, v2, v3)+.
     **/
    initialize: function(a, b, c) {
      this.a = vec3.create();
      this.b = vec3.create();
      this.c = vec3.create();
      this.center = vec3.create();
      this.normal = vec3.create();
    
      if (arguments.length > 0)
        this.set.apply(this, arguments);
      
    },
  
    /**
     * Jax.Geometry.Triangle#set(v1, v2, v3) -> Jax.Geometry.Triangle
     * - v1 (vec3): the first vertex.
     * - v2 (vec3): the second vertex.
     * - v3 (vec3): the third vertex.
     * 
     * Sets or replaces the current vertices with the given ones, then recalculates
     * the value for the center of this triangle as well as its normal.
     *
     * **Note** This is a copy by value, not by reference -- that is, the internal
     * vertex XYZ values are replaced but the vertex objects themselves are not. To
     * perform a copy by reference (thus retaining a reference to the exact arrays
     * passed in as arguments), see +Jax.Geometry.Triangle#assign+.
     **/
    set: function(a, b, c) {
      return this.assign(vec3.create(a), vec3.create(b), vec3.create(c));
    },
    
    /**
     * Jax.Geometry.Triangle#assign(v1, v2, v3) -> Jax.Geometry.Triangle
     * - v1 (vec3): the first vertex.
     * - v2 (vec3): the second vertex.
     * - v3 (vec3): the third vertex.
     * 
     * Sets or replaces the current vertices with the given ones, then recalculates
     * the value for the center of this triangle as well as its normal.
     *
     * **Note** This is a copy by reference, not by value -- that is, the triangle
     * will maintain a handle to each of the vec3 instances passed in as parameters.
     * If you don't know what this means, you probably want +Jax.Geometry.Triangle#set+
     * instead.
     **/
    assign: function(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
    
      // (a+b+c) / 3
      vec3.add(a, b, this.center);
      vec3.add(c, this.center, this.center);
      vec3.scale(this.center, 1/3);
      
      // calculate triangle normal
      var tmp = bufs.tmp = bufs.tmp || vec3.create();
      vec3.subtract(b, a, this.normal);
      vec3.subtract(c, a, tmp);
      vec3.cross(this.normal, tmp, this.normal);
      vec3.normalize(this.normal);
      
      this.updateDescription();
      return this;
    },
    
    /**
     * Jax.Geometry.Triangle#getNormal() -> vec3
     *
     * Returns the normal for this triangle. The normal is the vector
     * pointing perpendicular to the plane this triangle represents,
     * following the triangle's vertices in a counter-clockwise direction.
     *
     **/
    getNormal: function() {
      return this.normal;
    },
    
    toString: function() {
      return "Triangle: "+this.a+"; "+this.b+"; "+this.c;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(O, D, cp[, segmax]) -> Boolean
     * - O (vec3): origin
     * - D (vec3): direction
     * - cp (vec4): collision point [xyz] and distance [w] (output)
     * - segmax (Number): the maximum length of the ray; optional
     *
     * Tests for intersection with a ray, given an origin (O) and
     * direction (D). The +cp+ array receives the exact X, Y, Z position of the
     * collision; its W (fourth) element contains the distance from the origin
     * to the point of the collision, relative to the magnitude of D.
     * Allows testing against a finite segment by specifying the maximum length of
     * the ray in +segmax+, also relative to the magnitude of D.
     **/
    intersectRay: function(O, D, cp, segmax) {
      var p = this._p = this._p || new Jax.Geometry.Plane();
      p.set(this.a, this.b, this.c);
      var denom = vec3.dot(p.normal, D);
      if (Math.abs(denom) < Math.EPSILON) return false;
      var t = -(p.d + vec3.dot(p.normal, O)) / denom;
      if (t <= 0) return false;
      if (segmax != undefined && t > segmax) return false;

      // cp = O + t*D
      vec3.set(D, cp);
      vec3.scale(cp, t, cp);
      vec3.add(O, cp, cp);

      if (this.pointInTri(cp)) {
        cp[3] = t;
        return true;
      }
      return false;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(O, radius, cp) -> Boolean
     * - O (vec3): origin
     * - radius (Number): radius of sphere
     * - cp (vec3): collision point (output)
     *
     * Returns true if a sphere with the given origin and radius
     * intersects this triangle; if true, the exact point of
     * collision will be given in +cp+, unless +cp+ is omitted.
     **/
    intersectSphere: function(O, radius, cp) {
      var p = this._p = this._p || new Jax.Geometry.Plane();
      p.set(this.a, this.b, this.c);
      var dist = p.classify(O);
      if (Math.abs(dist) > radius) return false;

      var point = this._point = this._point || vec3.create();
      vec3.scale(p.normal, dist, point);
      vec3.subtract(O, point, point);
      if (this.pointInTri(point)) {
        if (cp) vec3.set(point, cp);
        return true;
      }

      // edge intersection detection
      var v = bufs.v = bufs.v || [];
      var u = bufs.u = bufs.u || vec3.create();
      var pa = bufs.pa = bufs.pa || vec3.create();
      var tmp = bufs.tmp = bufs.tmp || vec3.create();
      var radsquared = radius*radius;

      v[0] = this.a; v[1] = this.b; v[2] = this.c; v[3] = this.a;
      for (var i = 0; i < 3; i++) {
        vec3.subtract(v[i+1], v[i], u);
        vec3.subtract(O, v[i], pa);
        var s = vec3.dot(u, pa) / vec3.dot(u, u);

        if (s < 0) vec3.set(v[i], tmp);
        else if (s > 1) vec3.set(v[i+1], tmp);
        else { vec3.scale(u, s, tmp); vec3.add(v[i], tmp, tmp); }
        if (cp) vec3.set(tmp, cp);

        vec3.subtract(O, tmp, tmp);
        var sq_dist = vec3.dot(tmp, tmp);
        if (sq_dist <= radsquared) return true;
      }

      return false;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(t[, dest]) -> Boolean
     * - t (Jax.Geometry.Triangle): the triangle to test
     * - dest (vec3): optional vec3 to contain the point of intersection.
     *
     * Returns true if the given triangle intersects this one.
     *
     * If no receiving vector is supplied in which to store the point
     * of intersection, this data is ignored.
     *
     **/
    intersectTriangle: function(t, dest) {
      if (dest) return slow_tri_tri_intersect(this, t, dest);
      else return Jax.Geometry.Triangle.tri_tri_intersect(this.a, this.b, this.c, t.a, t.b, t.c);
    },
  
    /**
     * Jax.Geometry.Triangle#updateDescription() -> Jax.Geometry.Triangle
     *
     * Updates this triangle's normal and the indices used for the point
     * intersection test.
     *
     * This method is called automatically by +Jax.Geometry.Triangle#set()+.
     **/
    updateDescription: function() {
      var p = this.plane = this.plane || new Jax.Geometry.Plane(this.a, this.b, this.c);
      var n = p.normal;
      var a = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];

      if (a[0] > a[1])
      {
        if (a[0] > a[2]) { this._i1=1; this._i2=2; }
        else             { this._i1=0; this._i2=1; }
      }
      else
      {
        if (a[1] > a[2]) { this._i1=0; this._i2=2; }
        else             { this._i1=0; this._i2=1; }
      }
      
      return this;
    },
    
    /**
     * Jax.Geometry.Triangle#pointInTri(p) -> Boolean
     * - p (vec3): the point to be tested
     *
     * Returns true if the given point is within this triangle,
     * false otherwise.
     **/
    pointInTri: function(P) {
      var u = this._u = this._u || vec3.create();
      var v = this._v = this._v || vec3.create();
      u[0] = P[this._i1] - this.a[this._i1];
      u[1] = this.b[this._i1] - this.a[this._i1];
      u[2] = this.c[this._i1] - this.a[this._i1];
      v[0] = P[this._i2] - this.a[this._i2];
      v[1] = this.b[this._i2] - this.a[this._i2];
      v[2] = this.c[this._i2] - this.a[this._i2];

      var a, b;
      if (u[1] == 0) {
        b = u[0] / u[2];
        if (b >= 0 && b <= 1) a = (v[0] - b * v[2]) / v[1];
        else return false;
      } else {
        b = (v[0] * u[1] - u[0] * v[1]) / (v[2] * u[1] - u[2] * v[1]);
        if (b >= 0 && b <= 1) a = (u[0] - b * u[2]) / u[1];
        else return false;
      }
      return a >= 0 && (a+b) <= 1;
    }
  });
  
  // array-style accessors
  Object.defineProperty(Triangle.prototype, 0, {
    get: function() { return this.a; },
    set: function(v) { return this.a = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Triangle.prototype, 1, {
    get: function() { return this.b; },
    set: function(v) { return this.b = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Triangle.prototype, 2, {
    get: function() { return this.c; },
    set: function(v) { return this.c = v; },
    enumerable: false,
    configurable: false
  });
  
  return Triangle;
})();
