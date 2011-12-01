// This file is here to ease transition from glMatrix v0.9.5 to v1.1, which
// seems to introduce some bugs. (Or rather, fixes to bugs, which break Jax.)
// May as well keep it for future-proofing though.

describe("glMatrix", function() {
  var camera;
  beforeEach(function() {
    camera = new Jax.Camera();

    // sanity checks
    expect(camera.getViewVector()).toEqualVector([0,0,-1]);
    expect(camera.getUpVector()).toEqualVector([0,1,0]);
    expect(camera.getRightVector()).toEqualVector([1,0,0]);
  });
  
  describe("yawing 90 deg", function() {
    beforeEach(function() { camera.yaw(Math.deg2rad(90)); });
    
    it("should be facing 'right'", function() {
      expect(camera.getViewVector()).toEqualVector([-1,0,0]);
    });
    
    it("should have up vector 'up'", function() {
      expect(camera.getUpVector()).toEqualVector([0,1,0]);
    });
    
    it("should have right vector 'forward'", function() {
      expect(camera.getRightVector()).toEqualVector([0,0,-1]);
    });
  });
  
  describe("pitching 90 deg", function() {
    beforeEach(function() { camera.pitch(Math.deg2rad(90)); });
    
    it("should be facing 'up'", function() {
      expect(camera.getViewVector()).toEqualVector([0,1,0]);
    });
    
    it("should have up vector 'forward'", function() {
      expect(camera.getUpVector()).toEqualVector([0,0,1]);
    });
    
    it("should have right vector 'right'", function() {
      expect(camera.getRightVector()).toEqualVector([1,0,0]);
    });
  });

  describe("rolling 90 deg", function() {
    beforeEach(function() { camera.roll(Math.deg2rad(90)); });
    
    it("should be facing 'forward'", function() {
      expect(camera.getViewVector()).toEqualVector([0,0,-1]);
    });
    
    it("should have up vector 'left'", function() {
      expect(camera.getUpVector()).toEqualVector([1,0,0]);
    });
    
    it("should have right vector 'down'", function() {
      expect(camera.getRightVector()).toEqualVector([0,-1,0]);
    });
  });
});
