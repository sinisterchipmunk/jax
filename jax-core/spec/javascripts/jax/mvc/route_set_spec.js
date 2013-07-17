describe("Jax.RouteSet", function() {
  var map;
  var controller_class = Jax.Controller.create({index: function() { }});
  Jax.views.push("generic/index", function() { });
  
  beforeEach(function() {
    map = Jax.routes;
    map.clear();
  });
  
  describe("when a CamelCase controller name is given", function() {
    beforeEach(function() {
      controller_class = Jax.Controller.create("TestBreaker", {index: function() { }});
    });
    
    it("should recognize underscored route names", function() {
      var route = map.recognizeRoute("test_breaker");
      expect(route.controller).toEqual(controller_class);
    });
  });
  
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

    it("should return the controller name in an array", function() {
      var arr = map.getControllerNames();
      expect(arr.length).toEqual(1);
      expect(arr[0]).toEqual("welcome");
    });
  });
  
  describe("with a map", function() {
    beforeEach(function() { map.map("generic/index", controller_class, "index"); });
    
    it("should recognize the route without /index", function() {
      var route = map.recognizeRoute("generic");
      
      expect(route.controller).toEqual(controller_class);
      expect(route.action).toEqual("index");
    });
    
    it("should return the controller name in an array", function() {
      var arr = map.getControllerNames();
      expect(arr.length).toEqual(1);
      expect(arr[0]).toEqual("generic");
    });
  });
});
