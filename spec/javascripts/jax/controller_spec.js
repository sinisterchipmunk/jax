describe("Jax.Controller", function() {
  var klass;
  var instance;
  
  describe("which does not render or redirect", function() {
    beforeEach(function() {
      klass = Jax.Controller.create("welcome", { index: function() { } });
      instance = new klass();
    });
    
    it("should produce the view named after the controller and action names", function() {
      instance.fireAction("index");
      expect(instance.view_key).toEqual("welcome/index");
    });
    
    it("should map the route automatically", function() {
      expect(function() { Jax.routes.recognize_route("welcome/index") }).not.toThrow();
    });
  });
});
