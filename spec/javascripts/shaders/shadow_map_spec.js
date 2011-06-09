describe("Material segment 'shadow_map'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.ShadowMap());
    
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
