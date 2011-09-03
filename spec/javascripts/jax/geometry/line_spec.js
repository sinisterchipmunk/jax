describe("Jax.Geometry.Line", function() {
  var line;
  
  beforeEach(function() { line = new Jax.Geometry.Line(); });
  
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
