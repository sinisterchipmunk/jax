describe("Jax.RouteSet", function() {
  var map;
  var controller_class = Jax.Controller.create({index: function() { }});
  Jax.views.push("generic/index", function() { });
  
  beforeEach(function() { map = new Jax.RouteSet(); });
  
  describe("route descriptor", function() {
    var descriptor;
    
    it("from descriptor", function() {
      descriptor = map.getRouteDescriptor({controller:controller_class, id: 1});
      expect(descriptor.controller).toEqual(controller_class);
      expect(descriptor.action).toEqual("index");
      expect(descriptor.id).toEqual(1);
    });
    
    it("from controller (klass)", function() {
      descriptor = map.getRouteDescriptor(controller_class);
      expect(descriptor.controller).toEqual(controller_class);
      expect(descriptor.action).toEqual("index");
    });
    
    it("from controller (klass) and action name (string)", function() {
      descriptor = map.getRouteDescriptor(controller_class, "action_name");
      expect(descriptor.controller).toEqual(controller_class);
      expect(descriptor.action).toEqual("action_name");
    });
  });
  
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
    
    it("should return the controller instance", function() {
      expect(map.dispatch("/")).toBeKindOf(controller_class);
    });
  });
  
  describe("with no root", function() {
    it("should throw an error recognizing the root route", function() {
      expect(function() { map.recognize_route("/") }).toThrow(new Error("Route not recognized: '/'"));
    });
  });
});
