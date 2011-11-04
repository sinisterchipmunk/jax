describe("Jax.Geometry.Triangle", function() {
  describe("intersections", function() {
    describe("triangle", function() {
      var tri;
    
      beforeEach(function() {
        tri = new Jax.Geometry.Triangle([0,0,0], [-1,0,0], [0,1,0]);
      });
    
      describe("with triangle", function() {
        // more complete tritri tests found in tritri_spec.js
        it("no intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.5,2],[-1,0.5,2],[0,1.5,2]);
          expect(tri.intersectTriangle(tri2)).toBeFalsy();
        });

        it("intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          expect(tri.intersectTriangle(tri2)).toBeTruthy();
        });
        
        it("identical, positioned above", function() {
          tri = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          var tri2 = new Jax.Geometry.Triangle([0,3.95,-1],[-1,3.95,2],[1,3.95,2]);

          expect(tri.intersectTriangle(tri2)).toBeFalsy();
        });
      });
    
      describe("with triangle and capture line", function() {
        var line;
        beforeEach(function() { line = new Jax.Geometry.Line(); });
        
        // more complete tritri tests found in tritri_spec.js
        it("no intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.5,2],[-1,0.5,2],[0,1.5,2]);
          expect(tri.intersectTriangle(tri2, line)).toBeFalsy();
        });

        it("intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          expect(tri.intersectTriangle(tri2, line)).toBeTruthy();
          expect(Math.abs(line.a[0]) + Math.abs(line.a[1]) + Math.abs(line.a[2])).toBeGreaterThan(Math.EPSILON);
        });
        
        it("identical, positioned above", function() {
          tri = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          var tri2 = new Jax.Geometry.Triangle([0,3.95,-1],[-1,3.95,2],[1,3.95,2]);

          expect(tri.intersectTriangle(tri2, line)).toBeFalsy();
        });
      });
    
      describe("with triangle and capture vec3", function() {
        var point;
        beforeEach(function() { point = vec3.create(); });
        
        // more complete tritri tests found in tritri_spec.js
        it("no intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.5,2],[-1,0.5,2],[0,1.5,2]);
          expect(tri.intersectTriangle(tri2, point)).toBeFalsy();
        });

        it("intersect", function() {
          var tri2 = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          expect(tri.intersectTriangle(tri2, point)).toBeTruthy();
          expect(Math.abs(point[0]) + Math.abs(point[1]) + Math.abs(point[2])).toBeGreaterThan(Math.EPSILON);
        });
        
        it("identical, positioned above", function() {
          tri = new Jax.Geometry.Triangle([0,0.95,-1],[-1,0.95,2],[1,0.95,2]);
          var tri2 = new Jax.Geometry.Triangle([0,3.95,-1],[-1,3.95,2],[1,3.95,2]);

          expect(tri.intersectTriangle(tri2, point)).toBeFalsy();
        });
        
        it("identical, same position", function() {
          tri  = new Jax.Geometry.Triangle([-0.7006292939186096,0.5,0.5090369582176208], [-0.7911535501480103,0.5,0.3522442579269409], [-0.7390738129615784,0.5877852439880371,0.32905685901641846]);
          tri2 = new Jax.Geometry.Triangle([-0.7006292939186096,0.5,0.5090369582176208], [-0.7911535501480103,0.5,0.3522442579269409], [-0.7390738129615784,0.5877852439880371,0.32905685901641846]);
          
          expect(tri.intersectTriangle(tri2, point)).toBeTruthy();
          expect(Math.abs(point[0])+Math.abs(point[1])+Math.abs(point[2])).toBeGreaterThan(Math.EPSILON);
        });
      });
    
      describe("with ray", function() {
        it("intersect", function() {
          var O = [0,0,1];
          var D = [0,0,-1];
          var cp = [];
          var segmax = 2;
        
          expect(tri.intersectRay(O, D, cp, segmax)).toBeTruthy();
          // it intersects at [0,0,0], where distance from [0,0,-1] is 1
          expect(cp).toEqualVector([0,0,0,1]);
        });
      
        it("no intersect", function() {
          var O = [1,0,0];
          var D = [0,0,-1];
          var cp = [];
          var segmax = 2;
        
          expect(tri.intersectRay(O, D, cp, segmax)).toBeFalsy();
        });
      });

      describe("with sphere", function() {
        it("interior intersect", function() {
          var O = [-2,0,0];
          var radius = 1;
          var cp = [];
        
          expect(tri.intersectSphere(O, radius, cp)).toBeTruthy();
          expect(cp).toEqualVector([-1,0,0]);
        });
      
        it("edge intersect", function() {
          var O = [1,0.5,0];
          var radius = 1;
          var cp = [];
        
          expect(tri.intersectSphere(O, radius, cp)).toBeTruthy();
          expect(cp).toEqualVector([0,0.5,0]);
        });
      
        it("no intersect", function() {
          var O = [2, 0.5, 0];
          var radius = 1;
          var cp = [];

          expect(tri.intersectSphere(O, radius, cp)).toBeFalsy();
        });
      });
    });
  });
});
