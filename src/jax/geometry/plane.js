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
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  return Jax.Class.create({
    initialize: function(points) {
      if (points) this.set.apply(this, arguments);
    },
    
    /**
     * Jax.Geometry.Plane#set(points) -> Jax.Geometry.Plane
     * - points (Array): an array of 3 vectors.
     * Jax.Geometry.Plane#set(point0, point1, point2) -> Jax.Geometry.Plane
     * - point0 (vec3): the first of 3 vectors.
     * - point1 (vec3): the second of 3 vectors.
     * - point2 (vec3): the third of 3 vectors.
     * 
     * Sets this plane's coefficients based off of a set of three 3D points.
     *
     * This plane is returned.
     **/
    set: function(points) {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];
      
      this.normal = vec3.create();
      var vec = vec3.create();
      vec3.subtract(points[1], points[0], this.normal);
      vec3.subtract(points[2], points[0], vec);
      vec3.cross(this.normal, vec, this.normal);
      vec3.normalize(this.normal);
      
      this.point = points[1];
      this.d = -innerProduct(this.normal, this.point[0], this.point[1], this.point[2]);
      
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
     * Jax.Geometry.Plane#distance(point) -> Number
     * - point (vec3): A 3D vector. Can be any type with values for indices [0..2] (e.g. an Array).
     *
     * Given a 3D point, returns the distance from this plane to the point. The point is expected
     * to lie in the same 3D space as this plane.
     **/
    distance: function(point)
    {
      var x, y, z;
      if (arguments.length == 3) { x = arguments[0]; y = arguments[1]; z = arguments[2]; }
      else { x = point[0]; y = point[1]; z = point[2]; }
      // same as ax + by + cz + d
      return this.d + innerProduct(this.normal, x, y, z);
    },
    
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
    whereis: function(point)
    {
      if (arguments.length == 3) point = [arguments[0], arguments[1], arguments[2]];
      var d = this.distance(point);
      if (d > 0) return Jax.Geometry.Plane.FRONT;
      if (d < 0) return Jax.Geometry.Plane.BACK;
      return Jax.Geometry.Plane.INTERSECT;
    }
  });
})();

Jax.Geometry.Plane.FRONT     = 1;
Jax.Geometry.Plane.BACK      = 2;
Jax.Geometry.Plane.INTERSECT = 3;
