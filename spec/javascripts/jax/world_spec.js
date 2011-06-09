describe("Jax.World", function() {
  var world;
  
  beforeEach(function() {
    SPEC_CONTEXT.prepare();
    world = SPEC_CONTEXT.world;
  });
  
  describe("picking", function() {
    var at, ofront, otopleft, otopright, obottomleft, obottomright, mesh;
    
    beforeEach(function() {
      var width = document.getElementById('canvas-element').width,
          height = document.getElementById('canvas-element').height;
      at = { left: 0, right: width-1, top: height-1, bottom: 0,
             center_x: parseInt(width/2), center_y: parseInt(height/2) };

      // put some objects in the world for picking
      // function mesh() { return new Jax.Mesh.Sphere({size:1.0}); }
      
      mesh = new Jax.Mesh.Sphere();
      ofront       = world.addObject(new Jax.Model({position:[ 0.0, 0.0, -5],mesh:mesh}));
      otopleft     = world.addObject(new Jax.Model({position:[-2.5, 2.5, -5],mesh:mesh}));
      otopright    = world.addObject(new Jax.Model({position:[ 2.5, 2.5, -5],mesh:mesh}));
      obottomleft  = world.addObject(new Jax.Model({position:[-2.5,-2.5, -5],mesh:mesh}));
      obottomright = world.addObject(new Jax.Model({position:[ 2.5,-2.5, -5],mesh:mesh}));
    });
    
    glit("center",       function() { expect(world.pick(at.center_x, at.center_y)).toEqual(ofront); });
    glit("top left",     function() { expect(world.pick(at.left, at.top)).toEqual(otopleft); });
    glit("top right",    function() { expect(world.pick(at.right,at.top)).toEqual(otopright); });
    glit("bottom left",  function() { expect(world.pick(at.left, at.bottom)).toEqual(obottomleft); });
    glit("bottom right", function() { expect(world.pick(at.right,at.bottom)).toEqual(obottomright); });
    /*
    it("region: everything", function() {
      var objects = world.pickRegion(at.left, at.top, at.right, at.bottom);
      expect(objects).toContain(ofront);
      expect(objects).toContain(otopleft);
      expect(objects).toContain(otopright);
      expect(objects).toContain(obottomleft);
      expect(objects).toContain(obottomright);
    });
    
    it("region: top-left quadrant", function() {
      var objects = world.pickRegion(at.left, at.top, at.center_x, at.center_y);
      expect(objects).toContain(ofront);
      expect(objects).toContain(otopleft);
      expect(objects).not.toContain(otopright);
      expect(objects).not.toContain(obottomleft);
      expect(objects).not.toContain(obottomright);
    });

    it("region: top-right quadrant", function() {
      var objects = world.pickRegion(at.right, at.top, at.center_x, at.center_y);
      expect(objects).toContain(ofront);
      expect(objects).not.toContain(otopleft);
      expect(objects).toContain(otopright);
      expect(objects).not.toContain(obottomleft);
      expect(objects).not.toContain(obottomright);
    });

    it("region: bottom-left quadrant", function() {
      var objects = world.pickRegion(at.left, at.bottom, at.center_x, at.center_y);
      expect(objects).toContain(ofront);
      expect(objects).not.toContain(otopleft);
      expect(objects).not.toContain(otopright);
      expect(objects).toContain(obottomleft);
      expect(objects).not.toContain(obottomright);
    });
    
    it("region: bottom-right quadrant", function() {
      var objects = world.pickRegion(at.right, at.bottom, at.center_x, at.center_y);
      expect(objects).toContain(ofront);
      expect(objects).not.toContain(otopleft);
      expect(objects).not.toContain(otopright);
      expect(objects).not.toContain(obottomleft);
      expect(objects).toContain(obottomright);
    });
    */
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