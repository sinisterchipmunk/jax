describe("Jax.Geometry.Triangle", function() {
  describe("intersections", function() {
    describe("triangle", function() {
      var tri;
    
      beforeEach(function() {
        tri = new Jax.Geometry.Triangle([0,0,0], [-1,0,0], [0,1,0]);
      });

      it("should be CCW", function() {
        expect(tri).toBeCounterClockwise();
      });

      it("should not be CW", function() {
        expect(tri).not.toBeClockwise();
      });

      describe("with a matrix representing a look backward", function() {
        var mat;
        beforeEach(function() {
          mat = new Jax.Camera({direction: [0, 0, 1]}).getTransformationMatrix();
        });

        it("should not be CCW", function() {
          expect(tri).not.toBeCounterClockwise(mat);
        });

        it("should be CW", function() {
          expect(tri).toBeClockwise(mat);
        });
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
        
        it("should not raise errors", function() {
          // TypeError: Object [Line a:[Float32Array: -0.44343942403793335,0.4999999701976776,-0.4434394836425781], b:[Float32Array: 0.5037173628807068,-0.5,0.28691262006759644]] has no method 'contains' with
          var dist = vec3.create();
          var tri1 = new Jax.Geometry.Triangle([0.5,0.5,0.5000000596046448], [-0.5,0.4999999701976776,-0.5000000596046448], [0.5,0.4999999701976776,-0.5000000596046448]);
          var tri2 = new Jax.Geometry.Triangle([0.5037173628807068,0.5,0.28691262006759644], [0.5037173628807068,-0.5,0.28691262006759644], [0.8630872964859009,0.5,-0.6462825536727905]);
          
          expect(function() { tri1.intersectTriangle(tri2, dist); }).not.toThrow();
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

        it("should accept a vec4 as cp parameter", function() {

          var O = [-1.5328891277313232, 1.9750583171844482, 0.0059257312677800655];
          var D = [0.7422370314598083, -0.6457902193069458, -0.17899484932422638];
          var cp = [];

          var triangle = new Jax.Geometry.Triangle(
            [-0.891882598400116,1.443096399307251,0],
            [-0.985137939453125,1.3854613304138184,0],
            [-0.9207000732421875,1.4252861738204956,0.10426265746355057]
          );

          expect(triangle.intersectRay(O, D, cp)).toBeFalsy(); // OK, because it does not intersect

          cp = vec4.create();

          expect(triangle.intersectRay(O, D, cp)).toBeFalsy(); // WAT
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
