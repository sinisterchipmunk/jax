describe("Jax.Geometry.Plane", function() {
  describe("constructor", function() {
    it("should build the same plane from point and normal as from 3 points", function() {
      var p1 = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
      var p2 = new Jax.Geometry.Plane([0,0,0], [0,0,1]);
      
      expect(p1.normal).toEqualVector(p2.normal);
      expect(p1.d).toEqual(p2.d);
    })
  });
  
  describe("intersections", function() {
    var p;
    
    beforeEach(function() {
      p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    });
    
    describe("plane intersection", function() {
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
    
    describe("ray intersection", function() {
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
  });
  
  it("distance", function() {
    var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    expect(p.distance([0,0, 2])).toEqual(2);
    expect(p.distance([0,0,-2])).toEqual(-2);
    expect(p.distance([0,0, 0])).toEqual(0);

    var region = new Jax.DataRegion();
    var data = region.map(Float32Array, [0,0,2,  0,0,-2,  0,0,0]);
    var vertices = data.group(3);
    expect(p.distance(vertices[0])).toEqual(2);
    expect(p.distance(vertices[1])).toEqual(-2);
    expect(p.distance(vertices[2])).toEqual(0);
  });
  
  it("whereis", function() {
    var p = new Jax.Geometry.Plane([0,1,0], [-1,0,0], [1,0,0]);
    expect(p.whereis([0,0, 2])).toEqual(Jax.Geometry.Plane.FRONT);
    expect(p.whereis([0,0,-2])).toEqual(Jax.Geometry.Plane.BACK);
    expect(p.whereis([0,0, 0])).toEqual(Jax.Geometry.Plane.INTERSECT);
    
    var region = new Jax.DataRegion();
    var data = region.map(Float32Array, [0,0,2,  0,0,-2,  0,0,0]);
    var vertices = data.group(3);
    expect(p.whereis(vertices[0])).toEqual(Jax.Geometry.Plane.FRONT);
    expect(p.whereis(vertices[1])).toEqual(Jax.Geometry.Plane.BACK);
    expect(p.whereis(vertices[2])).toEqual(Jax.Geometry.Plane.INTERSECT);
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

    it('with a 3x3 data segment', function() {
      var region = new Jax.DataRegion();
      var data = region.map(Float32Array, [0,1,0,  -1,0,0,  1,0,0]);
      var vertices = data.group(3);
      var p = new Jax.Geometry.Plane(vertices);
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
