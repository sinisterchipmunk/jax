describe("Jax.World", function() {
  var world;
  
  beforeEach(function() {
    SPEC_CONTEXT.prepare();
    world = SPEC_CONTEXT.world;
  });

  describe("adding a light", function() {
    var added, light;
    beforeEach(function() {
      added = false;
      light = new Jax.Light.Directional();
      world.on('lightAdded', function(light) { added = light; });
      world.addLight(light);
    });

    it("should fire event including the light object", function() {
      expect(added).toBe(light);
    });

    describe("removing a light", function() {
      var removed;
      beforeEach(function() {
        removed = false;
        world.on('lightRemoved', function(light) { removed = light; });
        world.removeLight(light);
      });

      it("should fire event including the light object", function() {
        expect(removed).toBe(light);
      });
    });

  });
  
  describe("disposal", function() {
    it("should remove objects from itself", function() {
      // it used to do a simple delete on objects, but now there
      // are event listeners that have to be unhooked, etc.
      var obj = world.addObject(new Jax.Model());
      spyOn(world, 'removeObject').andCallThrough();
      world.dispose();
      expect(world.removeObject).toHaveBeenCalledWith(obj);
    });
    
    it("should handle removal of multiple objects", function() {
      world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
      world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
      world.dispose();
    });
    
    it("should handle removal of multiple lights", function() {
      world.addLight(new Jax.Light.Directional);
      world.addLight(new Jax.Light.Point);
      world.dispose();
    });
    
    it("should not encounter errors disposing after render", function() {
      world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
      world.render();
      world.dispose();
    });
    
    it("twice in a row should have no effect", function() {
      world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
      world.render();
      world.dispose();
      world.dispose();
    });
    
    it("should not return any objects", function() {
      world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
      world.render();
      world.dispose();
      expect(world.getObjects()).toEqual([]);
    });
  });
  
  it("should remove objects from the octree", function() {
    // it used to do a simple delete on objects, but now there
    // are event listeners that have to be unhooked, etc.
    var obj = world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad()}));
    world.removeObject(obj);
    expect(world.octree.nestedObjectCount).toEqual(0);
  });
  
  it("should not add mesh-less objects to the octree", function() {
    // because such models may have their own rendering algo,
    // and by default they won't be sent down the pipe anyway.
    world.addObject(new Jax.Model());
    expect(world.octree.nestedObjectCount).toEqual(0);
  });
  
  it("should call 'render' on mesh-less objects", function() {
    // validates that the object does in fact get rendered if
    // not added to the octree
    var called = false;
    var obj = world.addObject(new Jax.Model({render: function(){ called = true; }}));
    world.render();
    expect(called).toBeTrue()
  });
  
  it("should add meshed objects to the octree", function() {
    // because such models may have their own rendering algo,
    // and by default they won't be sent down the pipe anyway.
    world.addObject(new Jax.Model({mesh: new Jax.Mesh.Quad}));
    expect(world.octree.nestedObjectCount).toEqual(1);
  });
  
  it("should render opaque objects in front-to-back order relative to the camera", function() {
    world.octree.splitThreshold = 1;
    var log = [];
    var logThis = function() { log.push(this); };
    var obj2 = world.addObject(new Jax.Model({render: logThis, position: [0,0,-4], mesh: new Jax.Mesh.Sphere}));
    var obj1 = world.addObject(new Jax.Model({render: logThis, position: [0,0,-1], mesh: new Jax.Mesh.Sphere}));
    world.render();
    expect(log).toEqual([obj1, obj2]);
  });
  
  it("should render transparent objects in back-to-front order relative to the camera", function() {
    world.octree.splitThreshold = 1;
    var log = [];
    var logThis = function() { log.push(this); };
    var obj1 = world.addObject(new Jax.Model({render: logThis, transparent: true, position: [0,0,-1], mesh: new Jax.Mesh.Sphere}));
    var obj2 = world.addObject(new Jax.Model({render: logThis, transparent: true, position: [0,0,-4], mesh: new Jax.Mesh.Sphere}));
    world.render();
    expect(log).toEqual([obj2, obj1]);
  });
  
  it("should render transparent objects after opaque objects", function() {
    world.octree.splitThreshold = 1;
    var log = [];
    var logThis = function() { log.push(this); };
    var obj1 = world.addObject(new Jax.Model({render: logThis, transparent: true, position: [0,0,-4], mesh: new Jax.Mesh.Sphere}));
    var obj2 = world.addObject(new Jax.Model({render: logThis, transparent: false, position: [0,0,-1], mesh: new Jax.Mesh.Sphere}));
    world.render();
    expect(log).toEqual([obj2, obj1]);
  });
  
  it("should notify shadow maps when added objects are modified", function() {
    var light = world.addLight(new Jax.Light.Directional());
    var obj = world.addObject(new Jax.Model());
    light.shadowmap.validate(SPEC_CONTEXT);
    expect(light.shadowmap).toBeValid(); // sanity check
    
    obj.camera.move(1);
    expect(light.shadowmap).not.toBeValid();
  });
  
  it("should stop notifying shadow maps after object has been removed", function() {
    var light = world.addLight(new Jax.Light.Directional());
    var obj = world.addObject(new Jax.Model());
    world.removeObject(obj);
    light.shadowmap.validate(SPEC_CONTEXT);
    expect(light.shadowmap).toBeValid(); // sanity check
    
    obj.camera.move(1);
    expect(light.shadowmap).toBeValid();
  });
  
  it("should render objects added to the world", function() {
    var mat = new Jax.Material();
    rendered_ids = [];
    mat.render = function(context, mesh, model) { rendered_ids.push(model.__unique_id); };
    var o1 = new Jax.Model({mesh: new Jax.Mesh.Quad(), position: [-2, 0, -5]});
    var o2 = new Jax.Model({mesh: new Jax.Mesh.Quad(), position: [2, 0, -5]});
    var o1id = o1.__unique_id, o2id = o2.__unique_id;
    world.addObject(o1);
    world.addObject(o2);
    world.render(mat);
    expect(rendered_ids).toEqual([o1id, o2id]);
  });
  
  it("should return objects added to world", function() {
    var obj = new (Jax.Model.create({one:1}))();
    expect(world.addObject(obj)).toBe(obj);
  });
  
  it("should return light sources added to world", function() {
    var lite = new Jax.Light();
    expect(world.addLight(lite)).toBe(lite);
  });
  
  describe("picking", function() {
    var at, obj, otopleft, otopright, obottomleft, obottomright, mesh;

    beforeEach(function() {
      mesh = new Jax.Mesh.Sphere({radius: 1.0});
      obj  = world.addObject(new Jax.Model({position:[ 0.0, 0.0, -5],mesh:mesh}));
    });

    it("should find objects rendered by other objects", function() {
      var objNested = new Jax.Model({position: [0.0, 0.0, -5], mesh: mesh});
      obj.render = function(context, options) { objNested.render(context, options); };
      world.context.canvas.width = 1;
      world.context.canvas.height = 1;
      spyOn(world, 'pickRegionalIndices').andCallFake(function() {
        obj.render(world.context);
        return [objNested.__unique_id];
      });
      expect(world.pickRegion(0, 0, 1, 1)[0] === objNested).toBeTruthy();
    });
  });
  
  describe("with an object", function() {
    var model;
    beforeEach(function() { world.addObject(model = new Jax.Model()); });
    
    it("should remove objects by reference", function() {
      world.removeObject(model);
      expect(world.countObjects()).toEqual(0);
    });
  });
  
  describe("a model with `cull` set to `false`", function() {
    var model;
    beforeEach(function() { world.addObject(new Jax.Model({cull: false,mesh: new Jax.Mesh.Cube()})); });
    
    it("should not be added to the octree", function() {
      expect(world.octree.nestedObjectCount).toBe(0);
    });
  });
  
  describe("a mesh with `cull` set to `false`", function() {
    var model;
    beforeEach(function() { world.addObject(new Jax.Model({mesh: new Jax.Mesh.Cube({cull: false})})); });
    
    it("should not be added to the octree", function() {
      expect(world.octree.nestedObjectCount).toBe(0);
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
  
  describe("adding a light source from a string", function() {
    beforeEach(function() {
      Jax.Light.addResources({"test":{}});
      world.addLight("test");
    });
    
    it("should find the light source automatically", function() {
      expect(world.lights[0]).toBeInstanceOf(Jax.Light);
    });
  });
});
