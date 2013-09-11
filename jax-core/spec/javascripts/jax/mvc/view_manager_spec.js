describe("Jax.ViewManager", function() {
  var views;
  
  beforeEach(function() { views = new Jax.ViewManager(); });
  
  describe("with a view defined", function() {
    var view;
    beforeEach(function() {
      view = function() { };
      views.push("FooBars/index", view);
    });
    
    it("should indicate the view exists", function() {
      expect(views.exists("foo_bars/index")).toBeTruthy();
    });
    
    it("should indicate CamelCased variants of the view exist", function() {
      expect(views.exists("Foo_bars/index")).toBeTruthy();
      expect(views.exists("FooBars/index")).toBeTruthy();
    });
  });
  
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
