describe("Jax.Canvas", function() {
  var context;
  
  describe("with no routes", function() {
    beforeEach(function() { 
      Jax.routes.clear();
      context = new Jax.Context(SPEC_CONTEXT.canvas);
    });
    afterEach(function() { context.dispose(); });
  
    it("should keep a handle to canvas", function() {
      expect(context.canvas.id).toEqual("spec-canvas");
    });
  
    it("should not be rendering, because there's no root controller", function() {
      expect(context.isRendering()).toBeFalsy();
    });
  });
  
  describe("when redirecting", function() {
    beforeEach(function() {
      jasmine.Clock.useMock();
      
      Jax.routes.clear();
      
      Jax.views.push('one/index', function() { });
      Jax.views.push('two/index', function() { });

      var one = Jax.Controller.create("one", {index:function() {}});
      var two = Jax.Controller.create("two", {
        index:function() { this.world.addObject(new Jax.Model()); },
        update: function(tc) {  }
      });
      
      Jax.routes.map("/", one);
      Jax.routes.map("two", two);
      
      context = new Jax.Context(SPEC_CONTEXT.canvas);
    });
    
    afterEach(function() { context.dispose(); });
    
    it("should dispose the world", function() {
      spyOn(context.world, 'dispose').andCallThrough();
      context.redirectTo("two");
      expect(context.world.dispose).toHaveBeenCalled();
    });
    
    it("to a bad route should stop execution of current controller", function() {
      context.redirectTo("two");
      var two_instance = context.current_controller;
      
      jasmine.Clock.tick(Jax.update_speed+1);
      expect(function() { context.redirectTo("invalid"); }).toThrow("Route not recognized: 'invalid'");
      expect(context.world.objects.length).toEqual(0);
      
      spyOn(two_instance, "update"); // notice we can't do this earlier because it *does* get called above
      jasmine.Clock.tick(Jax.update_speed+1);
      expect(two_instance.update).not.toHaveBeenCalled();
    });
  });
  
  describe("with routes", function() {
    var controller;
    var action_called = 0, view_called = 0;
    
    beforeEach(function() {
      Jax.routes.clear();
      Jax.routes.root(Jax.Controller.create("welcome", {index: function() { action_called++; }}), "index");
      Jax.views.push("welcome/index", function() {
        this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        view_called++;
      });
      context = new Jax.Context(SPEC_CONTEXT.canvas);
    });
    afterEach(function() { context.dispose(); });
  
    it("should be rendering, because there's a controller", function() {
      expect(context.isRendering()).toBeTruthy();
    });
  });
});
