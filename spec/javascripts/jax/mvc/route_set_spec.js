describe("Jax.RouteSet", function() {
  var map;
  var controller_class = Jax.Controller.create({index: function() { }});
  Jax.views.push("generic/index", function() { });
  
  beforeEach(function() { map = Jax.routes; map.clear(); });
  
  describe("when a controller name is given during controller definition", function() {
    beforeEach(function() {
      controller_class = Jax.Controller.create("welcome", {index: function() { }});
    });
    
    it("should map routes automatically", function() {
      var route = map.recognizeRoute("welcome");
      expect(route.controller).toEqual(controller_class);
      expect(route.action).toEqual("index");
    });
    
    it("should automatically map actions added after controller is defined", function() {
      controller_class.prototype.other = function() { };
      var route = map.recognizeRoute("welcome/other");
      expect(route.controller).toEqual(controller_class);
      expect(route.action).toEqual("other");
    });
  });
  
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
  
  describe("with a map", function() {
    beforeEach(function() { map.map("generic/index", controller_class, "index"); });
    it("should recognize the route without /index", function() {
      var route = map.recognizeRoute("generic");
      
      expect(route.controller).toEqual(controller_class);
      expect(route.action).toEqual("index");
    });
  });
});
