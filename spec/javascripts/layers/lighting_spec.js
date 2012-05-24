describe("Material segment 'lighting'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    matr.addLayer(new Jax.Material.Lighting());
  });
  
  it("should render successfully", function() {
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
  });
});
