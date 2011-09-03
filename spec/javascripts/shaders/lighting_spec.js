describe("Material segment 'lighting'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.Lighting());
    
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
