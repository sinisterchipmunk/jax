describe("Jax.World", function() {
  var world;
  
  beforeEach(function() {
    s = this.suite;
    d = s.description;
    while (s) {
      s = s.parentSuite;
      if (s) d = s.description + " " + d;
    }
    
    SPEC_CONTEXT.prepare();
    world = SPEC_CONTEXT.world;
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
    expect(world.addLightSource(lite)).toBe(lite);
  });
  
  describe("picking", function() {
    var at, ofront, otopleft, otopright, obottomleft, obottomright, mesh;
    
    beforeEach(function() {
      var width = SPEC_CONTEXT.canvas.width,
          height = SPEC_CONTEXT.canvas.height;
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
    
    it("center",       function() { expect(world.pick(at.center_x, at.center_y) === ofront).toBeTruthy(); });
    it("top left",     function() { expect(world.pick(at.left, at.top)          === otopleft).toBeTruthy(); });
    it("top right",    function() { expect(world.pick(at.right,at.top)          === otopright).toBeTruthy(); });
    it("bottom left",  function() { expect(world.pick(at.left, at.bottom)       === obottomleft).toBeTruthy(); });
    it("bottom right", function() { expect(world.pick(at.right,at.bottom)       === obottomright).toBeTruthy(); });
    
    it("object blocked by another larger object", function() {
      var front = world.addObject(new Jax.Model({position: [0.0, 0.0, -0.01], mesh: new Jax.Mesh.Quad({size: 10})}));
      expect(world.pick(at.center_x, at.center_y)).toBe(front);
    });
    
    it("object blocking another larger object", function() {
      var rear = world.addObject(new Jax.Model({position: [0.0, 0.0, -7], mesh: new Jax.Mesh.Quad({size: 10})}));
      expect(world.pick(at.center_x, at.center_y)).toBe(ofront);
    });
    
    it("region: everything", function() {
      var objects = world.pickRegion(at.left, at.top, at.right, at.bottom);
      expect(objects.indexOf(ofront)).not.toEqual(-1);
      expect(objects.indexOf(otopleft)).not.toEqual(-1);
      expect(objects.indexOf(otopright)).not.toEqual(-1);
      expect(objects.indexOf(obottomleft)).not.toEqual(-1);
      expect(objects.indexOf(obottomright)).not.toEqual(-1);
    });
    
    it("region: top-left quadrant", function() {
      var objects = world.pickRegion(at.left, at.top, at.center_x, at.center_y);
      expect(objects.indexOf(ofront)).not.toEqual(-1);
      expect(objects.indexOf(otopleft)).not.toEqual(-1);
      expect(objects.indexOf(otopright)).toEqual(-1);
      expect(objects.indexOf(obottomleft)).toEqual(-1);
      expect(objects.indexOf(obottomright)).toEqual(-1);
    });
    
    it("region: top-right quadrant", function() {
      var objects = world.pickRegion(at.right, at.top, at.center_x, at.center_y);
      expect(objects.indexOf(ofront)).not.toEqual(-1);
      expect(objects.indexOf(otopleft)).toEqual(-1);
      expect(objects.indexOf(otopright)).not.toEqual(-1);
      expect(objects.indexOf(obottomleft)).toEqual(-1);
      expect(objects.indexOf(obottomright)).toEqual(-1);
    });
    
    it("region: bottom-left quadrant", function() {
      var objects = world.pickRegion(at.left, at.bottom, at.center_x, at.center_y);
      expect(objects.indexOf(ofront)).not.toEqual(-1);
      expect(objects.indexOf(otopleft)).toEqual(-1);
      expect(objects.indexOf(otopright)).toEqual(-1);
      expect(objects.indexOf(obottomleft)).not.toEqual(-1);
      expect(objects.indexOf(obottomright)).toEqual(-1);
    });
    
    it("region: bottom-right quadrant", function() {
      var objects = world.pickRegion(at.right, at.bottom, at.center_x, at.center_y);
      expect(objects.indexOf(ofront)).not.toEqual(-1);
      expect(objects.indexOf(otopleft)).toEqual(-1);
      expect(objects.indexOf(otopright)).toEqual(-1);
      expect(objects.indexOf(obottomleft)).toEqual(-1);
      expect(objects.indexOf(obottomright)).not.toEqual(-1);
    });
    
    it("should be able to pick objects not explicitly added to the world", function() {
      var onested = new Jax.Model({position: [0.0, 0.0, -5], mesh: mesh});
      ofront.render = function(context, options) { onested.render(context, options); };
      expect(world.pick(at.center_x, at.center_y) === onested).toBeTruthy();
    });

    it("should be able to regionally pick objects not explicitly added to the world", function() {
      var onested = new Jax.Model({position: [0.0, 0.0, -5], mesh: mesh});
      ofront.render = function(context, options) { onested.render(context, options); };
      expect(world.pickRegion(at.center_x-1, at.center_y-1, at.center_x+1, at.center_y+1)[0] === onested).toBeTruthy();
    });
  });
  
  describe("with an object", function() {
    var model;
    beforeEach(function() { world.addObject(model = new Jax.Model()); });
    
    it("should remove objects by reference", function() {
      world.removeObject(model);
      expect(world.countObjects()).toEqual(0);
    });

    it("should remove objects by ID", function() {
      world.removeObject(model.__unique_id);
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
  
  describe("adding a light source from a string", function() {
    beforeEach(function() {
      Jax.Light.addResources({"test":{}});
      world.addLightSource("test");
    });
    
    it("should find the light source automatically", function() {
      expect(world.lights[0]).toBeInstanceOf(Jax.Light);
    });
  });
});
