/**
 * class Jax.Geometry.Plane
 *
 * Represents a plane in 3 dimensions.
 *
 * Examples:
 *
 *     new Jax.Geometry.Plane([0,0,0], [0,1,0], [1,0,0]);
 *     new Jax.Geometry.Plane([[0,0,0], [0,1,0], [1,0,0]]);
 *     new Jax.Geometry.Plane();
 *
 **/
Jax.Geometry.Plane = (function() {
  var bufs = {};
  
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  /**
   * new Jax.Geometry.Plane(v1, v2, v3)
   * new Jax.Geometry.Plane(position, normal)
   * new Jax.Geometry.Plane(array_of_vertices)
   * new Jax.Geometry.Plane()
   * - v1 (vec3): first vertex
   * - v2 (vec3): second vertex
   * - v3 (vec3): third vertex
   * - array_of_vertices (Array): array of vertices in the form +[[x,y,z], [x,y,z], [x,y,z]]+
   * - position (vec3): the position of a point known to be in the plane
   * - normal (vec3): the vector normal to the surface of the plane
   *
   * If initialized with no arguments, the result is undefined until
   * the +set+ method is called. See +Jax.Geometry.Plane#set+
   **/
  function Plane(points) {
    /**
     * Jax.Geometry.Plane#point -> vec3
     *
     * A point in world space known to coincide with this plane.
     *
     * You can construct a duplicate of this plane with the following code:
     *
     *     var copy = new Plane(plane.point, plane.normal);
     *
     **/
    this.point = vec3.create();
    
    /**
     * Jax.Geometry.Plane#normal -> vec3
     *
     * The normal pointing perpendicular to this plane, assuming the front face is produced
     * by winding the vertices counter-clockwise.
     *
     * If the plane is constructed with no arguments, the normal defaults to the world up
     * direction [0,1,0].
     **/
    this.normal = vec3.clone([0,1,0]);
    
    /**
     * Jax.Geometry.Plane#d -> Number
     *
     * The fourth component in the plane equation.
     **/
    this.d = 0.0;
    
    if (arguments.length)
      this.set.apply(this, arguments);
  };

  jQuery.extend(Plane.prototype, {
    toString: function() {
      return "[Plane normal:"+vec3.str(this.normal)+"; D:"+this.d+"]";
    },
    
    /**
     * Jax.Geometry.Plane#intersectTriangle(t[, line]) -> Boolean
     * - t (Jax.Geometry.Triangle): a triangle
     * - line (Jax.Geometry.Line): optional Line to store the line of intersection
     *
     * Tests the triangle for intersection with this plane. If an intersection is found,
     * it may be stored in +line+. If +line+ is omitted, this data is ignored.
     *
     * Returns the result of the test: true for intersection, false otherwise.
     **/
    intersectTriangle: function(t, line) {
      var ad = this.classifyVec3(t.a), bd = this.classifyVec3(t.b), cd = this.classifyVec3(t.c);
      var sideAB = ad * bd, sideBC = bd * cd;
      if (sideAB > 0.0 && sideBC > 0.0) return false; // all points on same side of plane
      
      // at this point we know there is an intersection. If +line+ is undefined, we can stop.
      if (!line) return true;
      
      // find which point is on opposite side of plane, and which 2 lie on same side
      var otherSide, sameSide1, sameSide2;
      if (sideAB > 0) {
        sameSide1 = t.a;
        sameSide2 = t.b;
        otherSide = t.c;
      } else {
        if (sideBC > 0) {
          otherSide = t.a;
          sameSide1 = t.b;
          sameSide2 = t.c;
        } else {
          sameSide1 = t.a;
          otherSide = t.b;
          sameSide2 = t.c;
        }
      }
      
      var seg1 = bufs.tri_seg1 = bufs.tri_seg1 || new Jax.Geometry.Line();
      var seg2 = bufs.tri_seg2 = bufs.tri_seg2 || new Jax.Geometry.Line();
      seg1.set(otherSide, sameSide1);
      seg2.set(otherSide, sameSide2);
      
      // the result is simply the line from the intersection point of seg1 to the isect of seg2
      var p1 = bufs.tri_p1 = bufs.tri_p1 || vec3.create(),
          p2 = bufs.tri_p2 = bufs.tri_p2 || vec3.create();
      this.intersectLineSegment(seg1, p1);
      this.intersectLineSegment(seg2, p2);
      return line.set(p1, p2);
    },
    
    /**
     * Jax.Geometry.Plane#intersectLineSegment(line[, point]) -> Number
     * - line (Jax.Geometry.Line): a Line to test against
     * - point (vec3): an optional receiving vec3 to store the point of intersection in
     *
     * Returns Jax.Geometry.DISJOINT (which equals 0) if no intersection occurs,
     * Jax.Geometry.COINCIDE if the line segment is contained on this plane,
     * or Jax.Geometry.INTERSECT if the line segment intersects this plane.
     *
     * In the last case, if +point+ is given, the exact point of intersection will be
     * stored. Otherwise, this data is ignored.
     **/
    intersectLineSegment: function(line, point) {
      var u = vec3.subtract((bufs.lineseg_u = bufs.lineseg_u || vec3.create()), line.b, line.a);
      var w = vec3.subtract((bufs.lineseg_w = bufs.lineseg_w || vec3.create()), line.a, this.point);
      var D =  vec3.dot(this.normal, u);
      var N = -vec3.dot(this.normal, w);
      
      if (Math.abs(D) < Math.EPSILON)             // segment is parallel to plane
        if (N == 0) return Jax.Geometry.COINCIDE; // segment lies in plane
        else return Jax.Geometry.DISJOINT;
      
      // they are not parallel
      var sI = N / D;
      if (sI < 0 || sI > 1)
        return Jax.Geometry.DISJOINT;
      
      if (point)
        vec3.add(point, line.a, vec3.scale(point, u, sI));
      
      return Jax.Geometry.INTERSECT;
    },
    
    /**
     * Jax.Geometry.Plane#intersectRay(origin, direction) -> Number | false
     * - origin (vec3): the point at which the ray begins
     * - direction (vec3): the direction the ray extends. This must be
     *                     a unit vector.
     *
     * Returns the distance along the ray at which an intersection with this
     * plane occurs. If the ray is parallel to this plane, returns false.
     * If the ray is pointing away from this plane, a negative number will
     * be returned.
     *
     * The +direction+ argument must be normalized for the result to be accurate.
     **/
    intersectRay: function(origin, direction) {
      var numer = vec3.dot(this.normal, origin) + this.d;
      var denom = vec3.dot(this.normal, direction);
      
      if (denom == 0) // normal is orthogonal to vector, can't intersect
        return false;
        
      var result = -(numer / denom);
      return -(numer / denom);
    },
    
    /**
     * Jax.Geometry.Plane#intersectPlane(p[, line]) -> Number
     * - p (Jax.Geometry.Plane): the plane to test for intersection
     * - line (Jax.Geometry.Line): an optional receiving Line to contain the intersection
     *
     * Tests this plane against the +p+ for intersection. If no intersection is found,
     * the value Jax.Geometry.DISJOINT (which equals 0) is returned.
     *
     * If the planes are the same, the value Jax.Geometry.COINCIDE is returned.
     *
     * Otherwise, the value Jax.Geometry.INTERSECT is returned. If +line+ was given,
     * the exact line of intersection will be stored within it. Otherwise, this data
     * is ignored.
     **/
    intersectPlane: function(p, line) {
      var d1 = this.d, d2 = p.d;
      var p1n = this.normal, p2n = p.normal;
      var u = bufs.u = bufs.u || vec3.create();
      vec3.cross(u, p1n, p2n);
      var ax = (u[0] >= 0 ? u[0] : -u[0]);
      var ay = (u[1] >= 0 ? u[1] : -u[1]);
      var az = (u[2] >= 0 ? u[2] : -u[2]);
      
      // test if the two planes are parallel
      if ((ax+ay+az) < Math.EPSILON) { // planes are near parallel
        // test if disjoint or coincide
        if (Math.equalish(d1, d2)) return Jax.Geometry.COINCIDE;
        else return Jax.Geometry.DISJOINT;
      }
      
      if (line) {
        // both planes intersect a line
        // first determine max abs coordinate of cross product
        var maxc;
        if (ax > ay)
          if (ax > az) maxc = 0;
          else maxc = 2;
        else
          if (ay > az) maxc = 1;
          else maxc = 2;
        
        // next, to get a point on the intersect line
        // zero the max coord, and solve for the other two
        var iP = bufs.iP = bufs.iP || vec3.create(); // intersection point
        switch(maxc) {
          case 0: // intersect with x = 0
            iP[0] = 0;
            iP[1] = (d2 * p1n[2] - d1 * p2n[2]) / u[0];
            iP[2] = (d1 * p2n[1] - d2 * p1n[1]) / u[0];
            break;
          case 1: // intersect with y = 0
            iP[0] = (d1 * p2n[2] - d2 * p1n[2]) / u[1];
            iP[1] = 0;
            iP[2] = (d2 * p1n[0] - d1 * p2n[0]) / u[1];
            break;
          case 2: // intersect with z = 0
            iP[0] = (d2 * p1n[1] - d1 * p2n[1]) / u[2];
            iP[1] = (d1 * p2n[0] - d2 * p1n[0]) / u[2];
            iP[2] = 0;
            break;
        }
        
        vec3.copy(line[0], iP);
        vec3.add(line[1], iP, u);
      }
      
      return Jax.Geometry.INTERSECT;
    },
    
    /**
     * Jax.Geometry.Plane#classifyVec3(O) -> Number
     * - O (vec3): origin
     * 
     * equivalent to vec3.dot(this.normal, O) + this.d;
     **/
    classifyVec3: function(O) {
      if (O.array) return vec3.dot(this.normal, O.array) + this.d;
      else return vec3.dot(this.normal, O) + this.d;
    },
    
    /**
     * Jax.Geometry.Plane#classify(x, y, z) -> Number
     * 
     * equivalent to (but faster than) vec3.dot(this.normal, [x, y, z]) + this.d;
     **/
    classify: function(x, y, z) {
      var n = this.normal;
      return n[0] * x + n[1] * y + n[2] * z + this.d;
    },
    
    /**
     * Jax.Geometry.Plane#set(points) -> Jax.Geometry.Plane
     * Jax.Geometry.Plane#set(point0, point1, point2) -> Jax.Geometry.Plane
     * Jax.Geometry.Plane#set(position, normal) -> Jax.Geometry.Plane
     * - points (Array): an array of 3 vectors.
     * - point0 (vec3): the first of 3 vectors.
     * - point1 (vec3): the second of 3 vectors.
     * - point2 (vec3): the third of 3 vectors.
     * - position (vec3): the position of a point known to be in the plane
     * - normal (vec3): the vector normal to the surface of the plane
     * 
     * Sets this plane's coefficients based off of either a set of three 3D points,
     * or a single known point on the plane and the plane's normal.
     *
     * This plane is returned.
     **/
    set: function() {
      if (arguments.length == 2) {
        vec3.copy(this.normal, arguments[1]);
        this.d = -vec3.dot(arguments[1], arguments[0]);
      } else {
        var tmp1 = this.normal, tmp2 = bufs.settmp2 || (bufs.settmp2 = vec3.create());
        var points = arguments;
        
        if (arguments.length != 3) points = arguments[0];
        if (typeof(points[0]) == 'object' && points[0].array) {
          vec3.subtract(tmp1, points[1].array, points[0].array);
          vec3.subtract(tmp2, points[2].array, points[0].array);
          vec3.normalize(this.normal, vec3.cross(this.normal, tmp1, tmp2));
          this.d = -vec3.dot(this.normal, points[0].array);
        } else {
          vec3.subtract(tmp1, points[1], points[0]);
          vec3.subtract(tmp2, points[2], points[0]);
          vec3.normalize(this.normal, vec3.cross(this.normal, tmp1, tmp2));
          this.d = -vec3.dot(this.normal, points[0]);
        }
      }
      
      vec3.scale(this.point, this.normal, this.d);
      return this;
    },
    
    /**
     * Jax.Geometry.Plane#setCoefficients(a, b, c, d) -> Jax.Geometry.Plane
     *
     * Sets the four coefficients A, B, C, D for this plane.
     *
     * Returns this plane.
     **/
    setCoefficients: function(a, b, c, d) {
      var len = Math.sqrt(a*a+b*b+c*c);
      this.normal[0] = a/len;
      this.normal[1] = b/len;
      this.normal[2] = c/len;
      this.d = d/len;
      return this;
    },
    
    /**
     * Jax.Geometry.Plane#distance(x, y, z) -> Number
     *
     * Given a 3D point, returns the distance from this plane to the point. The point is expected
     * to lie in the same 3D space as this plane.
     **/
     // replaced with alias of #classify
    // distance: function(point)
    // {
    //   // same as ax + by + cz + d
    //   return this.classify(point);
    // },
    
    /**
     * Jax.Geometry.Plane#whereis(point) -> Number
     * - point (vec3): A 3D vector. Can be any type with values for indices [0..2] (e.g. an Array).
     *
     * Given a point in 3D space, returns one of the following values based on the position
     * of the point relative to this plane:
     *
     *     Jax.Geometry.Plane.FRONT
     *     Jax.Geometry.Plane.BACK
     *     Jax.Geometry.Plane.INTERSECT
     *
     * FRONT represents a point lying somewhere in the direction of the plane's normal.
     * BACK represents the opposite, and INTERSECT represents a point lying directly
     * parallel to this plane.
     *
     * The point is expected to lie in the same 3D space as this plane.
     **/
    whereis: function()
    {
      var point;
      if (arguments.length == 3) point = arguments;
      else if (arguments[0].array) point = arguments[0].array;
      else point = arguments[0];
      
      var d = this.distance(point);
      if (d > 0) return Jax.Geometry.Plane.FRONT;
      if (d < 0) return Jax.Geometry.Plane.BACK;
      return Jax.Geometry.Plane.INTERSECT;
    }
  });
  
  Plane.prototype.distance = Plane.prototype.classifyVec3;
  
  return Plane;
})();

Jax.Geometry.Plane.FRONT     = 1;
Jax.Geometry.Plane.BACK      = 2;
Jax.Geometry.Plane.INTERSECT = 3;
