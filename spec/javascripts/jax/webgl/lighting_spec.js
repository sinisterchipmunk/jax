describe("LightManager", function() {
  var mgr;
  
  describe("by default", function() {
    beforeEach(function() { mgr = new Jax.Scene.LightManager(); });
  
    it("should not be enabled", function() {
      expect(mgr.isEnabled()).toBeFalsy();
    });
    
    it("should not allow more than Jax.max_lights", function() {
      var max = Jax.max_lights;
      Jax.max_lights = 32;
      for (var i = 0; i < Jax.max_lights; i++)
        mgr.add(new Jax.Scene.LightSource());
      expect(function() { mgr.add(new Jax.Scene.LightSource()); }).
              toThrow(new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first."));
      Jax.max_lights = max;
    });

    describe("with one custom light", function() {
      beforeEach(function() { mgr.add(new Jax.Scene.LightSource({
        enabled:false,
        position:[0,0,1],
        direction:[0,-1,0],
        attenuation: {
          constant: 1,
          linear: 2,
          quadratic: 3
        },
        color: {
          ambient: [0.3,0.3,0.3,1],
          diffuse: [0.75,0.5,0.5,1],
          specular: [1,0,1,1]
        }
      })); });
      
      it("should have a light at index 0", function() { expect(mgr.getLight(0)).not.toBeUndefined(); });
      
      it("should have ambient [0.3,0.3,0.3,1]",  function() { expect(mgr.getAmbientColor(0)).toEqualVector([0.3,0.3,0.3,1]);  });
      it("should have diffuse [0.75,0.5,0.5,1]", function() { expect(mgr.getDiffuseColor(0)).toEqualVector([0.75,0.5,0.5,1]); });
      it("should have specular [1,0,1,1]",       function() { expect(mgr.getSpecularColor(0)).toEqualVector([1,0,1,1]);       });
      it("should have constant att 1",           function() { expect(mgr.getConstantAttenuation(0)).toEqual(1);               });
      it("should have linear att 1",             function() { expect(mgr.getLinearAttenuation(0)).toEqual(2);                 });
      it("should have quadratic att 1",          function() { expect(mgr.getQuadraticAttenuation(0)).toEqual(3);              });
      it("should shine towards [0,-1,0]",        function() { expect(mgr.getDirection(0)).toEqualVector([0,-1,0]);            });
      it("should be at [0,0,1]",                 function() { expect(mgr.getPosition(0)).toEqualVector([0,0,1]);              });
      it("should be enabled",                    function() { expect(mgr.isEnabled()).toBeTruthy(); });
      it("should have disabled light",           function() { expect(mgr.isEnabled(0)).toBeFalsy(); });
    });
    
    describe("with one default light", function() {
      beforeEach(function() { mgr.add(new Jax.Scene.LightSource()); });
      
      it("should be enabled", function() {
        expect(mgr.isEnabled()).toBeTruthy();
        expect(mgr.isEnabled(0)).toBeTruthy();
      });
    });
  });
});
