describe("Material segment 'paraboloid'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material.Paraboloid();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  it("should compile successfully", function() {
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    expect(matr.prepareShader).toHaveBeenCalled();
  });

  it("should be rendered in both directions", function() {
    var front = false, back = false;
    var mesh = new Jax.Mesh.Quad({material:matr});
    
    var old_render = mesh.render;

    mesh.render = function(context, model, material) {
      if (model && model.direction ===  1) front = true;
      if (model && model.direction === -1) back  = true;
      old_render.apply(this, arguments);
    };
    
    SPEC_CONTEXT.world.addObject(new Jax.Model({mesh: mesh}));
    SPEC_CONTEXT.world.addLightSource(new Jax.Scene.LightSource({type:Jax.POINT_LIGHT}));
    SPEC_CONTEXT.world.render();
    
    expect(front).toBeTrue();
    expect(back).toBeTrue();
  });
});
