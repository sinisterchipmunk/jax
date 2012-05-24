describe("Opt: Basic shader", function() {
  /*
  FIXME update conditional tangent calculation spec
  These specs used to describe when exactly tangents should be calculated,
  but materials no longer work like this. The specs here are disabled because
  they don't apply, but the file is still here so that the specs can be translated
  over to the new form.
  */
  var model;
  var _tex = "/textures/rss.png", _norm = "/textures/normal_map.jpg";
  
  beforeEach(function() {
    model = new Jax.Model({mesh: new Jax.Mesh.Quad()});
    SPEC_CONTEXT.world.addObject(model);
  });
  
  describe("without textures", function() {
    xit("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: _tex});
    });
    
    xit("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal map texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({texture: {path:_norm, type:Jax.NORMAL_MAP}});
    });
    
    xit("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });

  describe("with 2 regular textures", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, _tex]});
    });
    
    xit("should not build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).not.toHaveBeenCalled();
    });
  });

  describe("with 1 normal and 1 regular texture", function() {
    beforeEach(function() {
      model.mesh.material = new Jax.Material({textures: [_tex, {path:_norm,type:Jax.NORMAL_MAP}]});
    });
    
    xit("should build tangent space", function() {
      spyOn(model.mesh, 'getTangentBuffer').andCallThrough();
      SPEC_CONTEXT.world.render();
      expect(model.mesh.getTangentBuffer).toHaveBeenCalled();
    });
  });
});
