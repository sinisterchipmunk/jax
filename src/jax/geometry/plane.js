Jax.Geometry.Plane = (function() {
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  return Jax.Class.create({
    initialize: function(points) {
      if (points) this.set.apply(this, arguments);
    },
    
    set: function(points) {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];
      
      this.normal = vec3.create();
      var vec = vec3.create();
      vec3.subtract(points[1], points[0], this.normal);
      vec3.subtract(points[2], points[0], vec);
      vec3.cross(this.normal, vec, this.normal);
      vec3.normalize(this.normal);
      
//      vec3.subtract(points[1], points[0], this.normal);
//      vec3.cross(this.normal, vec3.subtract(points[2], points[0], vec3.create()));
//      vec3.normalize(this.normal);
//      this.normal = (points[1].minus(points[0])).cross(points[2].minus(points[0])).normalize();
      this.point = points[1];
      this.d = -innerProduct(this.normal, this.point[0], this.point[1], this.point[2]);
    },
    
    setCoefficients: function(a, b, c, d) {
      var len = Math.sqrt(a*a+b*b+c*c);
      this.normal[0] = a/len;
      this.normal[1] = b/len;
      this.normal[2] = c/len;
      this.d = d/len;
    },
    
    distance: function(point)
    {
      var x, y, z;
      if (arguments.length == 3) { x = arguments[0]; y = arguments[1]; z = arguments[2]; }
      else { x = point[0]; y = point[1]; z = point[2]; }
      // same as ax + by + cz + d
      return this.d + innerProduct(this.normal, x, y, z);
    },
    
    whereis: function(point)
    {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];
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
