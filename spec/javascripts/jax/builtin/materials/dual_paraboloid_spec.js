describe("Material segment 'dual_paraboloid'", function() {
  var context;
  var matr;
  
  beforeEach(function() {
    context = new Jax.Context(document.getElementById('canvas-element'));
    matr = new Jax.Material.DualParaboloid();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  afterEach(function() { context.dispose(); });
  
  it("should compile successfully", function() {
    new Jax.Mesh({material:matr}).render(context);
    expect(matr.prepareShader).toHaveBeenCalled();
  });

  it("should be rendered in both directions", function() {
    var front = false, back = false;
    var mesh = new Jax.Mesh.Quad({material:matr});
    
    var old_render = mesh.render;

    mesh.render = function(context, options) {
      if (options && options.direction && options.direction ==  1) front = true;
      if (options && options.direction && options.direction == -1) back = true;
      old_render.apply(this, arguments);
    };
    
    context.world.addObject(new Jax.Model({mesh: mesh}));
    context.world.addLightSource(new Jax.Scene.LightSource({type:Jax.POINT_LIGHT}));
    context.world.render();
    
    expect(front).toBeTrue();
    expect(back).toBeTrue();
  });
});
