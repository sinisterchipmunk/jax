describe("'basic' Shader Builder", function() {
  var context;
  var material;
  
  beforeEach(function() { context = new Jax.Context(document.getElementById('canvas-element')); });
  afterEach(function() { context.dispose(); });
  
  describe("with 1 texture", function() {
    beforeEach(function() {
      material = new Jax.Material({name:"basic", texture:"/public/images/rss.png"});
    });
    
    it("should compile", function() {
      var obj = new Jax.Mesh({material:material,shader:"basic"});
      spyOn(material, 'buildShader').andCallThrough();
      obj.render(context);
      expect(material.buildShader).toHaveBeenCalledWith("basic");
    });
  
    it("should use the shader from world", function() {
      var obj = new Jax.Model({mesh:new Jax.Mesh.Sphere({material:material,shader:"basic"})});
      var called = false;
      obj.mesh.render = function(context, options) {
        called = called || this.getNormalizedRenderOptions(options).shader == "basic";
      };
      context.world.addObject(obj);
      context.world.render();
      expect(called).toBeTrue();
    });
  });
});
