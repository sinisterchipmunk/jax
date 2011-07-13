describe("Jax.Geometry.Plane", function() {
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
