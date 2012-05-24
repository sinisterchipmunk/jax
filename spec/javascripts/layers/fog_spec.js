describe("Material segment 'fog'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    matr.addLayer(new Jax.Material.Fog());
  });
  
  it("should render successfully", function() {
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
  });
});
