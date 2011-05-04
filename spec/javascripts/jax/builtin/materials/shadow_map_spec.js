describe("Material segment 'shadow_map'", function() {
  var context;
  var matr;
  
  beforeEach(function() {
    context = new Jax.Context(document.getElementById('canvas-element'));
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  afterEach(function() { context.dispose(); });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.ShadowMap());
    
    new Jax.Mesh({material:matr}).render(context);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
