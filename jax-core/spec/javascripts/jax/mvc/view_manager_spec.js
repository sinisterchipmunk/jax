describe("Jax.ViewManager", function() {
  var views;
  
  beforeEach(function() { views = new Jax.ViewManager(); });
  
  describe("with one registered view", function() {
    beforeEach(function() { views.push("controller/action", function() { }); });
    
    it("should return the registered view", function() {
      expect(views.find("controller/action")).toBeInstanceOf(Function);
    });
    
    it("should return null when requesting a missing view", function() {
      expect(views.find("missing/action")).toBeNull();
    });
  });
});
