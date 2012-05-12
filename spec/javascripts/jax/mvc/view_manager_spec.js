describe("Jax.ViewManager", function() {
  var views;
  
  beforeEach(function() { views = new Jax.ViewManager(); });
  
  describe("with one registered view", function() {
    beforeEach(function() { views.push("controller/action", function() { }); });
    
    it("should return the registered view", function() {
      expect(views.get("controller/action")).toBeInstanceOf(Jax.View);
    });
    
    it("should throw an error when requesting a missing view", function() {
      expect(function() { return views.get("missing/action"); }).toThrow(new Error("Could not find view at 'missing/action'!"));
    });
  });
});
