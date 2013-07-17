describe("Jax", function() {
  it("should be loaded", function() {
    /* if false, then it didn't load all of the Jax libraries successfully */
    expect(Jax.loaded).toBeTrue();
  });
  
  it("should create the top-level view container", function() {
    expect(Jax.views).not.toBeUndefined();
  });
  
  it("should initialize the route set", function() {
    expect(Jax.routes).not.toBeUndefined();
  });
});
