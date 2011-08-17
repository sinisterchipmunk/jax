describe("Jax.Geometry.Line", function() {
  var line;
  
  beforeEach(function() { line = new Jax.Geometry.Line(); });
  
  it("should delegate index accessors", function() {
    expect(line[0]).toBe(line.a);
    expect(line[1]).toBe(line.b);
    expect(line[2]).toBeUndefined();
  });
});
