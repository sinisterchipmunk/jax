describe("Material segment 'normal_map'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.NormalMap(new Jax.Texture("/images/normal_map.jpg")));
    
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
