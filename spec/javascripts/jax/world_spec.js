describe("Jax.World", function() {
  var context;
  var world;
  
  beforeEach(function() {
    context = new Jax.Context('canvas-element');
    world = context.world;
  });
  
  afterEach(function() {
    context.dispose();
  });
  
  describe("with lighting disabled", function() {
    beforeEach(function() { world.lighting.disable(); });
    
    it("should default to the 'basic' shader", function() {
      var model = new Jax.Model();
      world.addObject(model);
      model.render = function(context, options) {
        expect(options.default_material).toEqual("basic");
      };
      world.render();
    });
  });
});