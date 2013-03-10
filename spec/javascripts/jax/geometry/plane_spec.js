describe("Jax.Geometry.Plane", function() {
  describe("constructor", function() {
    it("should build the same plane from point and normal as from 3 points", function() {
      var p1 = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
      var p2 = new Jax.Geometry.Plane([0,0,0], [0,0,1]);
      
      expect(p1.normal).toEqualVector(p2.normal);
      expect(p1.d).toEqual(p2.d);
    })
  });
  
  it('should be able to reconstruct itself using point and normal getters', function() {
    var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    var p2 = new Jax.Geometry.Plane(p.point, p.normal);
    expect(p.normal).toEqualVector(p2.normal);
    expect(p.d).toEqual(p2.d);
  });
  
  describe("intersections", function() {
    var p;
    
    beforeEach(function() {
      p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    });
    
    describe("triangle", function() {
      it("parallel", function() {
        expect(p.intersectTriangle(new Jax.Geometry.Triangle([0,1,1], [-1,0,1], [1,0,1]))).toBeFalsy();
      });

      it("outside", function() {
        expect(p.intersectTriangle(new Jax.Geometry.Triangle([0,0,2], [-1,0,1], [1,0,1]))).toBeFalsy();
      });

      it("intersect", function() {
        expect(p.intersectTriangle(new Jax.Geometry.Triangle([0,0,-1], [-1,0,1], [1,0,1]))).toBeTruthy();
      });
      
      it("intersect with receiver", function() {
        var r = new Jax.Geometry.Line();
        p.intersectTriangle(new Jax.Geometry.Triangle([0,0,-1], [-1,0,1], [1,0,1]), r);
        expect(r.length).toBeGreaterThan(Math.EPSILON);
      });
    });
    
    describe("plane", function() {
      it("disjoint (no intersect)", function() {
        var p2 = new Jax.Geometry.Plane([0,1,1], [-1,0,1], [1,0,1]);
        expect(p.intersectPlane(p2)).toBeFalsy();
      });
      
      it("coincide", function() {
        var p2 = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
        expect(p.intersectPlane(p2)).toEqual(Jax.Geometry.COINCIDE);
      });
      
      it("intersect", function() {
        var p2 = new Jax.Geometry.Plane([0,0,1], [-1,0,0], [1,0,0]);
        expect(p.intersectPlane(p2)).toEqual(Jax.Geometry.INTERSECT);
      });
      
      it("intersect line", function() {
        var p2 = new Jax.Geometry.Plane([0,0,1], [-1,0,0], [1,0,0]);
        var line = new Jax.Geometry.Line();
        p.intersectPlane(p2, line);
        expect(line[0]).toEqualVector([ 0,0,0]);
        expect(line[1]).toEqualVector([ 1,0,0]);
      });
    });
    
    describe("ray", function() {
      it("parallel should not intersect", function() {
        expect(p.intersectRay([0,0,1], [1,0,0])).toBeFalsy();
      });
      
      it("from the front", function() {
        expect(p.intersectRay([0,0,1], [0,0,-1])).toEqual(1);
      });
      
      it("from behind", function() {
        expect(p.intersectRay([0,0,-1],[0,0, 1])).toEqual(1);
      });

      it("pointing away", function() {
        expect(p.intersectRay([0,0,-1],[0,0,-1])).toEqual(-1);
      });
    });

    describe("line segment", function() {
      it("store intersection point", function() {
        var i = vec3.create();
        p.intersectLineSegment(new Jax.Geometry.Line([0,0,1], [0,0,-1]), i);
        expect(i).toEqualVector([0,0,0]);
      });
      
      it("parallel", function() {
        expect(p.intersectLineSegment(new Jax.Geometry.Line([0,0,1], [1,0,1]))).toBeFalsy();
      });
      
      it("coincident", function() {
        expect(p.intersectLineSegment(new Jax.Geometry.Line([0,0,0], [0.5,0,0]))).toEqual(Jax.Geometry.COINCIDE);
      });
      
      it("from the front", function() {
        expect(p.intersectLineSegment(new Jax.Geometry.Line([0,0,1], [0,0,-1]))).toEqual(Jax.Geometry.INTERSECT);
      });
      
      it("from behind", function() {
        expect(p.intersectLineSegment(new Jax.Geometry.Line([0,0,-1],[0,0, 1]))).toEqual(Jax.Geometry.INTERSECT);
      });

      it("pointing away", function() {
        expect(p.intersectLineSegment(new Jax.Geometry.Line([0,0,-1],[0,0,-2]))).toEqual(Jax.Geometry.DISJOINT);
      });
    });
  });
  
  it("distance", function() {
    var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    expect(p.distance([0,0, 2])).toEqual(2);
    expect(p.distance([0,0,-2])).toEqual(-2);
    expect(p.distance([0,0, 0])).toEqual(0);
  });
  
  it("whereis", function() {
    var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    expect(p.whereis([0,0, 2])).toEqual(Jax.Geometry.Plane.FRONT);
    expect(p.whereis([0,0,-2])).toEqual(Jax.Geometry.Plane.BACK);
    expect(p.whereis([0,0, 0])).toEqual(Jax.Geometry.Plane.INTERSECT);
  });
  
  describe("construction", function() {
    it("with no vertices", function() {
      var p = new Jax.Geometry.Plane();
      expect(p.normal).toEqualVector([0,1,0]);
      expect(p.d).toEqual(0);
    });

    it('with a vertex array', function() {
      var p = new Jax.Geometry.Plane([[0,1,0], [-1,0,0], [1,0,0]]);
      expect(p.normal).toEqualVector([0,0,1]);
      expect(p.d).toEqual(0);
    });

    it("with vertices", function() {
      var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
      expect(p.normal).toEqualVector([0,0,1]);
      expect(p.d).toEqual(0);
    });
  });
  
  it("set coefficients", function() {
    var p = new Jax.Geometry.Plane();
    p.setCoefficients(0, 2, 0, 1);
    expect(p.normal).toEqualVector([0,1,0]);
    expect(p.d).toEqual(0.5);
  });
});
