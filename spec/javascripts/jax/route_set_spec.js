describe("Jax.RouteSet", function() {
  var map;
  var controller_class = Jax.Controller.create({index: function() { }});
  Jax.views.push("generic/index", function() { });
  
  beforeEach(function() { map = new Jax.RouteSet(); });
  
  describe("with a root", function() {
    beforeEach(function() { map.root(controller_class, "index"); });
    
    it("should recognize the root route", function() {
      var route = map.recognize_route("/");
      
      expect(route.controller).toEqual(controller_class);
      expect(route.action).toEqual("index");
    });
    
    it("should dispatch to the root controller", function() {
      spyOn(controller_class, 'invoke').andCallThrough();
      map.dispatch("/");
      expect(controller_class.invoke).toHaveBeenCalledWith("index");
    });
    
    it("should set the Jax.current_controller", function() {
      map.dispatch("/");
      expect(Jax.current_controller).toBeKindOf(controller_class);
    });
    
    it("should set the Jax.current_view", function() {
      map.dispatch("/");
      expect(Jax.current_view).toBeKindOf(Jax.View);
    });
  });
  
  describe("with no root", function() {
    it("should throw an error recognizing the root route", function() {
      expect(function() { map.recognize_route("/") }).toThrow(new Error("Route not recognized: '/'"));
    });
  });
});
