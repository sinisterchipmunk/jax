describe("Material segment 'normal_map'", function() {
  var context;
  var matr;
  
  beforeEach(function() {
    context = new Jax.Context(document.getElementById('canvas-element'));
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  afterEach(function() { context.dispose(); });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.NormalMap(new Jax.Texture("/public/images/normal_map.jpg")));
    
    new Jax.Mesh({material:matr}).render(context);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
