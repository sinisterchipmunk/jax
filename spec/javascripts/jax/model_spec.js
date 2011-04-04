describe("Jax.Model", function() {
  var model;
  
  describe("without any custom methods", function() {
    beforeEach(function() { model = Jax.Model.create({}); });
    
    it("should render", function() {
      var context = new Jax.Context('canvas-element');
      new model({mesh:new Jax.Mesh.Quad()}).render(context);
      context.dispose();
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
