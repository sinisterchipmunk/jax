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
    
  describe("without any custom methods", function() {
    beforeEach(function() {
      model = Jax.Model.create({
        initialize: function($super, data) { $super(Jax.Util.normalizeOptions(data, {mesh:new Jax.Mesh.Quad()})); }
      });
    });
    
    describe("instantiated", function() {
      beforeEach(function() { model = new model(); });
      
      describe("that is not a shadowcaster", function() {
        beforeEach(function() { model.shadow_caster = false; });
        it("should still be lit", function() { expect(model).toBeIlluminated(); });
      });

      describe("that is not lit", function() {
        beforeEach(function() { model.lit = false; });
        it("should not be rendered in illumination pass", function() {
          expect(model).not.toBeIlluminated();
        });
      });

      it("should render properly", function() {
        var context = new Jax.Context('canvas-element');
        model.render(context);
        context.dispose();
      });
    });
  
    it("should fire after_initialize", function() {
      model.addResources({ "name": { fired: false } });
      model.addMethods({ after_initialize: function() { this.fired = true; } });
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
