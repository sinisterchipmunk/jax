describe("Opt: Basic shader", function() {
  var model, context;
  var _tex = "/images/rss.png", _norm = "/images/normal_map.jpg";
  
  beforeEach(function() {
    context = new Jax.Context('canvas-element');
    model = new Jax.Model({mesh: new Jax.Mesh.Quad()});
    context.world.addObject(model);
  });
  
  afterEach(function() { context.dispose(); });
  
  describe("without textures", function() {
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      context.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: _tex});
    });
    
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      context.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal map texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: {path:_norm, type:Jax.NORMAL_MAP}});
    });
    
    it("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      context.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });

  describe("with 2 regular textures", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, _tex]});
    });
    
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      context.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal and 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, {path:_norm,type:Jax.NORMAL_MAP}]});
    });
    
    it("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      context.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });
});
