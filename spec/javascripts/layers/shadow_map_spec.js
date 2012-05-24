describe("Material segment 'shadow_map'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    matr.addLayer(new Jax.Material.ShadowMap());
  });
  
  it("should render successfully", function() {
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
  });
});
