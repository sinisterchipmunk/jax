describe("Jax.Model", function() {
  var model;
  
  describe("as a resource", function() {
    // do these things only once, because we're going to see how one model instance interacts with another
    var klass, res_data = { "name": {one: { value : 1 } } };
    klass = Jax.Model.create({});
    klass.addResources(res_data);

    beforeEach(function() {
      model = klass.find("name");
    });
    
    it("should find new resource instances instead of existing ones", function() {
      model.two = 2;
      model = klass.find("name");
      expect(model.two).toBeUndefined();
    });
    
    it("should not alter the original resource data", function() {
      model.one.value = 2;
      model = klass.find("name");
      expect(model.one.value).not.toEqual(2);
    });
  });
  
  describe("added to world without a mesh", function() {
    beforeEach(function() { model = new (Jax.Model.create({after_initialize:function(){}}))({position:[0,0,0]}); SPEC_CONTEXT.world.addObject(model); });
    
    it("should not cause errors when rendering", function() {
      expect(function() { SPEC_CONTEXT.world.render(); }).not.toThrow();
    });
  });
    
  describe("without any custom methods", function() {
    beforeEach(function() {
      model = Jax.Model.create({ after_initialize: function() { this.mesh = new Jax.Mesh.Quad(); } });
    });
    
    describe("instantiated", function() {
      beforeEach(function() { model = new model(); });
      
      it("should render properly", function() {
        model.render(SPEC_CONTEXT);
      });
    });
  
    it("should fire after_initialize", function() {
      model.addResources({ "name": { fired: false } });
      jQuery.extend(model.prototype, { after_initialize: function() { this.fired = true; } });
      expect(model.find("name").fired).toBeTrue();
    });
    
    it("should raise an error when searching for a missing ID", function() {
      model.addResources({"one": { } });
      expect(function() { model.find("two") }).toThrow(new Error("Resource 'two' not found!"));
    });
    
    it("should assign default attribute values", function() {
      model.addResources({'default':{one:'one'},'name':{two:'two'}});
      expect(model.find('name').one).toEqual("one");
      expect(model.find('name').two).toEqual("two");
    });

    it("should assign attribute values", function() {
      model.addResources({ "name": { one: "one" } });
      expect(model.find("name").one).toEqual("one");
    });
  
    it("should instantiate a model that is missing default attributes", function() {
      expect(function() { new model(); }).not.toThrow();
    });
  });
  
  describe("with a custom method", function() {
    beforeEach(function() { model = Jax.Model.create({method: function() { return "called"; } }); });
    it("should work", function() { expect(new model().method()).toEqual("called"); });
  });
});
