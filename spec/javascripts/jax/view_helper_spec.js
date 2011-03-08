describe("Jax.ViewHelper", function() {
  var helper;
  
  beforeEach(function() {
    helper = Jax.ViewHelper.create({
      test_method: function() { return 1; }
    });
  });
  
  it("should mix in helpers with View", function() {
    expect(new Jax.View(function() { }).test_method()).toEqual(1);
  });
});