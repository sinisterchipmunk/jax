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
    
    it("should default to the 'basic' shader", function() {
      var model = new Jax.Model();
      world.addObject(model);
      model.render = function(context, options) {
        expect(options.default_shader).toEqual("basic");
      };
      world.render();
    });
  });

  describe("with lighting enabled", function() {
    beforeEach(function() { world.addLightSource(new Jax.Scene.LightSource({type:Jax.DIRECTIONAL_LIGHT})); });
    
    it("should default to the 'blinn-phong' shader", function() {
      var model = new Jax.Model({mesh:new Jax.Mesh.Quad()});
      world.addObject(model);
      expect(model).toDefaultToShader('blinn-phong', world);
    });
    
    it("should use the 'blinn-phong' shader", function() {
      var model = new Jax.Model({mesh:new Jax.Mesh.Quad()});
      world.addObject(model);
      expect(model).toUseShader('blinn-phong', world);
    });
    
    describe("but the object unlit", function() {
      var model;
      
      beforeEach(function() {
        // notice the explicit use of "basic" here. This is so we can test that explicit "basic" types
        // get rendered as such, instead of simply being chucked into the "lighting is enabled, use blinn-phong"
        // category.
        model = new Jax.Model({mesh:new Jax.Mesh.Sphere({shader:"basic",color:[0.5,0.5,0.5,1]}), lit:false });
      });
      
      describe("and unshadowed", function() {
        beforeEach(function() {
          model = new Jax.Model({mesh:new Jax.Mesh.Quad(), shadow_caster: false, lit:false});
        });
        
        it("should use basic shader", function() {
          world.addObject(model);
          expect(model).toUseShader('basic', world);
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
      
      it("should be rendered with basic shader", function() {
        world.addObject(model);
        expect(model).toUseShader('basic', world);
      });
    });
  });
});