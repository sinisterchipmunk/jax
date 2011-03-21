describe("Camera", function() {
  var camera, control;
  
  beforeEach(function() { camera = new Jax.Camera(); });
  
  describe("by default", function() {
    it("should have position [0,0,0]", function() { expect(camera.getPosition()).toEqualVector([0,0,0]); });
    it("should have view [0,0,-1]", function() { expect(camera.getViewVector()).toEqualVector([0,0,-1]); });
    it("should have right [1,0,0]", function() { expect(camera.getRightVector()).toEqualVector([1,0,0]); });
    it("should have up [0,1,0]", function() { expect(camera.getUpVector()).toEqualVector([0,1,0]); });
  });
  
  it("should set and get position accurately", function() {
    camera.setPosition(20, 0, 20);
    expect(camera.getPosition()).toEqualVector([20,0,20]);
  });
  
  it("should lookAt the origin without losing position", function() {
    camera.setPosition(20, 0, 20);
    expect(camera.getPosition()).toEqualVector([20,0,20]);
    camera.lookAt([0,0,0], [0,1,0]);
    expect(camera.getPosition()).toEqualVector([20,0,20]);
  });
  
  it("should set view relative to position", function() {
    camera.setPosition(10, 10, 10);
    camera.orient([-1, 0, 0], [0, 1, 0]);
    
    expect(camera.getPosition()).toEqualVector([10,10,10]);
    expect(camera.getViewVector()).toEqualVector([-1,0,0]);
    expect(camera.getUpVector()).toEqualVector([0,1,0]);
  });
  
  describe("orienting the camera after translation", function() {
    beforeEach(function() {
      camera.setPosition(100, 100, 100);
      camera.orient([0, 0, -1], [0, 1, 0]);
    });
    
    it("should not change its position", function() { expect(camera.getPosition()).toEqualVector([100,100,100]); });
    
  });
  
  describe("orientation", function() {
    it(" pos(0,0,1), view(0,-1,0)", function() {
      camera.setPosition(0,0,1);
      camera.orient(0,-1,0);
      expect(camera.getViewVector()).toEqualVector([0,-1,0]);
    });
  });

  describe("looking", function() {
    beforeEach(function() { camera.lookAt([0,0,-1], [0,1,0], [0,0,0]); });
    
    it("should return position accurately", function() {
      expect(camera.getPosition()).toEqualVector([0,0,0]);
    });

    it("should return view accurately", function() {
      expect(camera.getViewVector()).toEqualVector([0,0,-1]);
    });

    it("should return up accurately", function() {
      expect(camera.getUpVector()).toEqualVector([0,1,0]);
    });

    it("should return right accurately", function() {
      expect(camera.getRightVector()).toEqualVector([1,0,0]);
    });
  });
  
  it("should set the position using numbers", function() {
    camera.setPosition(1, 1, 1);
    expect(camera.getPosition()).toEqualVector([1,1,1]);
  });
  
  it("should set the position using a vector", function() {
    camera.setPosition([1,1,1]);
    expect(camera.getPosition()).toEqualVector([1,1,1]);
  });
  
  describe("orienting the camera with numeric arguments and no position", function() {
    beforeEach(function() {
      camera.orient(0, 0, 1,  0, -1, 0);
    });
    
    it("position should be 0,0,0", function() { expect(camera.getPosition()).toEqualVector([0,0,0]);      });
    it("view should be 0,0,1",     function() { expect(camera.getViewVector()).toEqualVector([0, 0, 1]);  });
    it("up should be 0,-1,0",      function() { expect(camera.getUpVector()).toEqualVector([0, -1, 0]);   });
    it("right should be 1,0,0",    function() { expect(camera.getRightVector()).toEqualVector([1, 0, 0]); });
  });
  
  it("should strafe right", function() {
    camera.strafe(10);
    expect(camera.getPosition()).toEqualVector([10, 0, 0]);
  });

  it("should strafe left", function() {
    camera.strafe(-10);
    expect(camera.getPosition()).toEqualVector([-10, 0, 0]);
  });
  
  it("should move forward", function() {
    camera.move(10);
    expect(camera.getPosition()).toEqualVector([0,0,-10]);
  });
  
  it("should move backward", function() {
    camera.move(-10);
    expect(camera.getPosition()).toEqualVector([0,0,10]);
  });
  
  it("should move 'forward' along a given vector", function() {
    camera.move(10, [0,1,0]);
    expect(camera.getPosition()).toEqualVector([0,10,0]);
  });
  
  it("should move 'backward' along a given vector", function() {
    camera.move(-10, [0,1,0]);
    expect(camera.getPosition()).toEqualVector([0,-10,0]);
  });

  describe("events", function() {
    beforeEach(function() {
      spyOn(camera, 'fireEvent').andCallThrough();
    });
    
    it("should fire matrixUpdated when setPosition called", function() {
      camera.setPosition(1, 1, 1);
      expect(camera.fireEvent).toHaveBeenCalledWith('matrixUpdated');
    });
    
    it("should fire matrixUpdated when orient called", function() {
      camera.orient(0, 0, -1, 0, 1, 0);
      expect(camera.fireEvent).toHaveBeenCalledWith('matrixUpdated');
    });
  });
});