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
  
  describe("with an object", function() {
    beforeEach(function() { world.addObject(new Jax.Model()); });
    
    it("should remove the object", function() {
      world.removeObject(world.getObject(0));
      expect(world.countObjects()).toEqual(0);
    });
  });
  
  describe("with lighting disabled", function() {
    beforeEach(function() { world.lighting.disable(); });
    
    // we no longer switch materials in Jax.World depending on lighting. "Basic" and "default" are the same, now.
    xit("should default to the 'basic' material", function() {
      var model = new Jax.Model();
      world.addObject(model);
      expect(model).toDefaultToMaterial("basic", world);
      world.render();
    });
  });

  describe("with lighting enabled", function() {
    beforeEach(function() { world.addLightSource(new Jax.Scene.LightSource({type:Jax.DIRECTIONAL_LIGHT})); });
    
    it("should default to the 'default' material", function() {
      var model = new Jax.Model({mesh:new Jax.Mesh.Quad()});
      world.addObject(model);
      expect(model).toDefaultToMaterial('default', world);
    });
    
    xit("should use the 'default' material", function() {
      var model = new Jax.Model({mesh:new Jax.Mesh.Quad()});
      world.addObject(model);
      expect(model).toUseMaterial('default', world);
    });
    
    describe("but the object unlit", function() {
      var model;
      
      beforeEach(function() {
        // notice the explicit use of "basic" here. This is so we can test that explicit "basic" types
        // get rendered as such, instead of simply being chucked into the "lighting is enabled, use blinn-phong"
        // category.
        model = new Jax.Model({mesh:new Jax.Mesh.Sphere({material:"basic",color:[0.5,0.5,0.5,1]}), lit:false });
      });
      
      describe("and unshadowed", function() {
        beforeEach(function() {
          model = new Jax.Model({mesh:new Jax.Mesh.Quad(), shadow_caster: false, lit:false});
        });
        
        xit("should use basic material", function() {
          world.addObject(model);
          expect(model).toUseMaterial('basic', world);
        });
        
        it("should not cast a shadow", function() {
          world.addObject(model);
          expect(model).not.toCastShadow(world);
        });
      });
      
      it("should still cast a shadow", function() {
        world.addObject(model);
        expect(world.getShadowCasters()).toContain(model);
        expect(model).toCastShadow(world);
      });
      
      xit("should be rendered with basic material", function() {
        world.addObject(model);
        expect(model).toUseMaterial('basic', world);
      });
    });
  });
});