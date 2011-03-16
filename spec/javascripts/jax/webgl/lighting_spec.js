describe("LightManager", function() {
  var mgr;
  
  describe("by default", function() {
    beforeEach(function() { mgr = new Jax.Scene.LightManager(); });
  
    it("should not be enabled", function() {
      expect(mgr.isEnabled()).toBeFalsy();
    });
    
    it("should not allow more than Jax.max_lights", function() {
      for (var i = 0; i < Jax.max_lights; i++)
        mgr.add(new Jax.Scene.LightSource());
      expect(function() { mgr.add(new Jax.Scene.LightSource()); }).
              toThrow(new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first."));
    });

    describe("with one light", function() {
      beforeEach(function() { mgr.add(new Jax.Scene.LightSource()); });
      
      it("should be enabled", function() {
        expect(mgr.isEnabled()).toBeTruthy();
        expect(mgr.isEnabled(0)).toBeTruthy();
      });
    });
  });
});