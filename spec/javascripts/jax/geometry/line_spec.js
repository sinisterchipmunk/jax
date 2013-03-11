describe("Jax.Geometry.Line", function() {
  var line;
  
  beforeEach(function() { line = new Jax.Geometry.Line(); });

  describe("after being set", function() {
    beforeEach(function() { line.set([0,0,0], [1,0,0]); });

    it("should contain points on it", function() {
      // twice, to expose any caching-related issues
      expect(line.contains([0.5,0,0])).toBe(true);
      expect(line.contains([0.5,0,0])).toBe(true);
    });

    it("should not contain points not on it", function() {
      // twice, to expose any caching-related issues
      expect(line.contains([0.5,1,0])).toBe(false);
      expect(line.contains([0.5,1,0])).toBe(false);
    });
  });
  
  it("should delegate index accessors", function() {
    expect(line[0]).toBe(line.a);
    expect(line[1]).toBe(line.b);
    expect(line[2]).toBeUndefined();
  });
  
  it("should return itself from #set", function() {
    expect(line.set([0,0,0], [1,1,1])).toBe(line);
  });
  
  it("should calculate length", function() {
    line.set([1,1,0], [2,2,0]);
    expect(line.length).toEqual(Math.sqrt(2));
  });
});
