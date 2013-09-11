describe("Jax.Controller", function() {
  var klass;
  var instance;
  
  // describe("with a view defined", function() {
  //   var view;
  //   beforeEach(function() {
  //     view = function() { };
  //     Jax.views.push("FooBars/index", view);
  //   });
    
  //   it("should override the default view", function() {
  //     Jax.Controller.create("FooBars", {});
  //     expect(Jax.views.find("foo_bars/index")).toBe(view);
  //   });
  // });
  
  // describe("with an update method", function() {
  //   var context;
    
  //   beforeEach(function() {
  //     jasmine.Clock.useMock();
  //     klass = Jax.Controller.create("welcome", { index: function() { }, update: function(tc) { } });
  //     Jax.views.push("welcome/index", function() { });
  //     Jax.routes.map("welcome", klass);
  //     instance = SPEC_CONTEXT.redirectTo("welcome");
  //   });
    
  //   it("should be called with the elapsed time in seconds", function() {
  //     spyOn(instance, 'update');
  //     SPEC_CONTEXT.startRendering();
  //     SPEC_CONTEXT.startUpdating();
  //     jasmine.Clock.tick(1000);
  //     expect(instance.update).toHaveBeenCalledWithIsh([0.016]);
  //     SPEC_CONTEXT.stopUpdating();
  //   });
  // });

  // describe("which does not render or redirect", function() {
  //   beforeEach(function() {
  //     klass = Jax.Controller.create("welcome", { index: function() { } });
  //     instance = new klass();
  //   });
    
  //   it("should produce the view named after the controller and action names", function() {
  //     instance.fireAction("index", this.context);
  //     expect(instance.view_key).toEqual("welcome/index");
  //   });
    
  //   it("should map the route automatically", function() {
  //     expect(function() { Jax.routes.recognizeRoute("welcome/index") }).not.toThrow();
  //   });
  // });
});
