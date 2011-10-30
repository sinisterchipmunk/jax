describe("Opt: Basic shader", function() {
  var model;
  var _tex = "/textures/rss.png", _norm = "/textures/normal_map.jpg";
  
  beforeEach(function() {
    model = new Jax.Model({mesh: new Jax.Mesh.Quad()});
    SPEC_CONTEXT.world.addObject(model);
  });
  
  describe("without textures", function() {
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: _tex});
    });
    
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal map texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: {path:_norm, type:Jax.NORMAL_MAP}});
    });
    
    it("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });

  describe("with 2 regular textures", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, _tex]});
    });
    
    it("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal and 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, {path:_norm,type:Jax.NORMAL_MAP}]});
    });
    
    it("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });
});
