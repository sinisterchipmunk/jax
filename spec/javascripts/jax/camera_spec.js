describe("Jax.Camera", function() {
  var camera, control;
  
  beforeEach(function() { camera = new Jax.Camera(); });

  describe("after translating forward", function() {
    beforeEach(function() {
      camera.move(10);
    });

    it("should have proper direction vectors", function() {
      expect(camera.direction).toEqualVector([0,0,-1]);
      expect(camera.up).toEqualVector([0,1,0]);
      expect(camera.right).toEqualVector([1,0,0]);
    });

    describe("yawing 90 deg", function() {
      beforeEach(function() { camera.yaw(Math.deg2rad(90)); });
      
      it("should be facing 'right'", function() {
        expect(camera.direction).toEqualVector([-1,0,0]);
      });
      
      it("should have up vector 'up'", function() {
        expect(camera.up).toEqualVector([0,1,0]);
      });
      
      it("should have right vector 'forward'", function() {
        expect(camera.right).toEqualVector([0,0,-1]);
      });
      
      it("should produce expected quat", function() {
        expect(camera.rotation).toEqualVector([0,0.707106,0,0.707106]);
      });
      
      it("should produce expected mat4", function() {
        expect(camera.getTransformationMatrix()).toEqualVector([0,0,-1,0,0,1,0,0,1,0,0,0,0,0,-10,1]);
      });
    });
    
    describe("pitching 90 deg", function() {
      beforeEach(function() { camera.pitch(Math.deg2rad(90)); });
      
      it("should be facing 'up'", function() {
        expect(camera.direction).toEqualVector([0,1,0]);
      });
      
      it("should have up vector 'forward'", function() {
        expect(camera.up).toEqualVector([0,0,1]);
      });
      
      it("should have right vector 'right'", function() {
        expect(camera.right).toEqualVector([1,0,0]);
      });
      
      it("should produce expected quat", function() {
        expect(camera.rotation).toEqualVector([0.707106,0,0,0.707106]);
      });
      
      it("should produce expected mat4", function() {
        expect(camera.getTransformationMatrix()).toEqualVector([1,0,0,0,0,0,1,0,0,-1,0,0,0,0,-10,1]);
      });
    });

    describe("rolling 90 deg", function() {
      beforeEach(function() { camera.roll(Math.deg2rad(90)); });
      
      it("should be facing 'forward'", function() {
        expect(camera.direction).toEqualVector([0,0,-1]);
      });
      
      it("should have up vector 'left'", function() {
        expect(camera.up).toEqualVector([1,0,0]);
      });
      
      it("should have right vector 'down'", function() {
        expect(camera.right).toEqualVector([0,-1,0]);
      });
      
      it("should produce expected quat", function() {
        expect(camera.rotation).toEqualVector([0,0,-0.707106,0.707106]);
      });
      
      it("should produce expected mat4", function() {
        expect(camera.getTransformationMatrix()).toEqualVector([0,-1,0,0,1,0,0,0,0,0,1,0,0,0,-10,1]);
      });
    });
  });
  
  describe("its frustum", function() {
    var frustum;
    beforeEach(function() {
      camera.perspective({near:0.1,far:10,height:100,width:100});
      frustum = camera.frustum;
    });
    
    it("should know when a cube is in front of it", function() {
      expect(frustum.cube([0, 0, -5], 0.1, 0.1, 0.1)).toBe(Jax.Frustum.INSIDE);
    });
    
    it("should know when a cube is behind it", function() {
      expect(frustum.cube([0, 0, 5], 0.1, 0.1, 0.1)).toBe(Jax.Frustum.OUTSIDE);
    });

    it("should know when a cube is intersecting it", function() {
      expect(frustum.cube([0, 0, 0], 10, 10, 10)).toBe(Jax.Frustum.INTERSECT);
    });
  });

  it("should not fail to set direction after disabling fixed yaw", function() {
    camera.setFixedYawAxis(false);
    camera.direction = [-1, 0, 0];
    expect(camera.direction).toEqualVector([-1, 0, 0]);
  });
  
  it("should initialize camera when given position and direction", function() {
    camera = new Jax.Camera({position: [1,1,1], direction:[2,2,2]});
    expect(camera.position).toEqualVector([1,1,1]);
    expect(camera.direction).toEqualVector(vec3.normalize([], [2,2,2]));
  });
  
  it("should not change its orientation when looking in its current direction", function() {
    camera.lookAt([0,0,-1]);
    
    expect(camera.direction).toEqualVector([0,0,-1]);
    expect(camera.right).toEqualVector([1,0,0]);
    expect(camera.up).toEqualVector([0,1,0]);
  });
  
  it("should not change its orientation when looking in its current direction given a position", function() {
    camera.lookAt([0,0,-1], [0,0,5]);
    
    expect(camera.direction).toEqualVector([0,0,-1]);
    expect(camera.right).toEqualVector([1,0,0]);
    expect(camera.up).toEqualVector([0,1,0]);
  });
  
  it("should be able to reverse direction without losing orientation", function() {
    camera.position = [0, 0, -5];
    camera.direction = [0, 0, 1];
    expect(camera.position).toEqualVector([0, 0, -5]);
    expect(camera.direction).toEqualVector([0, 0, 1]);
    expect(camera.up).toEqualVector([0, 1, 0]);
    expect(camera.right).toEqualVector([-1, 0, 0]);

    camera.position = [0, 0, 5];
    camera.direction = [0, 0, -1];
    expect(camera.position).toEqualVector([0, 0, 5]);
    expect(camera.direction).toEqualVector([0, 0, -1]);
    expect(camera.up).toEqualVector([0, 1, 0]);
    expect(camera.right).toEqualVector([1, 0, 0]);
  });
  
  it("should unproject properly", function() {
    camera.perspective({width:800,height:500,near:0.1,far:200});
    
    camera.position = [38.375, 75, 44.25];
    // camera.setUpVector([0, 0.196116, -0.980580]);
    // camera.setRightVector([1,0,0]);
    camera.direction = [0, -0.980580, -0.196116];
    
    // sanity checks
    expect(camera.position).toEqualVector([38.375, 75, 44.25]);
    expect(camera.up).toEqualVector([0, 0.196116, -0.980580]);
    expect(camera.right).toEqualVector([1,0,0]);
    expect(camera.direction).toEqualVector([0, -0.980580, -0.196116]);
    
    
    var nearest = [ 38.308727, 74.893821, 44.271007 ];
    var farthest = [-94.170295, -137.355697, 86.258216];
    
    // all that for this:
    expect(camera.unproject(0, 0, 0)).toEqualVector(nearest);
    expect(camera.unproject(0, 0, 1)).toEqualVector(farthest);
    expect(camera.unproject(0, 0)[0]).toEqualVector(nearest);
    expect(camera.unproject(0, 0)[1]).toEqualVector(farthest);
  });
  
  it("movement with rotations", function() {
    camera.move(10);
    camera.yaw(Math.PI/2);
    camera.move(10);
    expect(camera.position).toEqualVector(-10, 0, -10);
  });
  
  it("rotation then reset", function() {
    camera.position = [1,1,1];
    camera.pitch(1);
    camera.yaw(1);
    camera.roll(1);
    camera.reset();
    expect(camera.direction).toEqualVector([0,0,-1]);
    expect(camera.position).toEqualVector([0,0,0]);
    expect(camera.up).toEqualVector([0,1,0]);
    expect(camera.right).toEqualVector([1,0,0]);
  });
  
  it("strafing with rotations", function() {
    camera.move(10);
    camera.yaw(Math.PI/2);
    camera.strafe(10);
    expect(camera.position).toEqualVector(0, 0, -20);
  });
  
  it("multiple rotations", function() {
    camera.pitch(Math.PI/6); // rotate up a bit
    camera.yaw(Math.PI/6); // rotate to side a bit
    // check for camera drift
    expect(camera.up).toEqualVector([0.25,0.8660253286361694,0.4330127239227295]);
  });
  
  it("should project move and strafe", function() {
    var pos = camera.projectMovement(1, 1);
    vec3.subtract(pos, pos, camera.position);
    expect(pos).toEqualVector([1,0,-1])
  });
  
  describe("with fixed yaw axis", function() {
    // this is the default, no beforeEach necessary
    
    it("should not lose up vector", function() {
      camera.position = [-1.8,0.35,1.8];
      camera.lookAt([0,0,0]);
      var up = camera.up;
      // FIXME is this safe?
      expect(Math.abs(up[0])).toBeLessThan(0.1);
      expect(Math.abs(up[1])).toBeGreaterThan(0.9);
      expect(Math.abs(up[2])).toBeLessThan(0.1);
      // expect(camera.up).toEqualVector([0,1,0]);
    });
  });
  
  describe("without fixed yaw axis", function() {
    beforeEach(function() { camera.setFixedYawAxis(false); });

    it("multiple rotations", function() {
      camera.pitch(Math.PI/6); // rotate up a bit
      camera.yaw(Math.PI/6); // rotate to side a bit
      // check for camera drift
      expect(camera.up).toEqualVector([0,0.8660253286361694,0.4999999701976776]);
    });
  });
  
  describe("by default", function() {
    it("should have position [0,0,0]", function() { expect(camera.position).toEqualVector([0,0,0]); });
    it("should have view [0,0,-1]", function() { expect(camera.direction).toEqualVector([0,0,-1]); });
    it("should have right [1,0,0]", function() { expect(camera.right).toEqualVector([1,0,0]); });
    it("should have up [0,1,0]", function() { expect(camera.up).toEqualVector([0,1,0]); });
  });
  
  describe("perspective projection", function() {
    beforeEach(function() { camera.perspective({fov:45,near:0.1,far:500,width:2048,height:1024}); });
    
    it("should have fov 45", function() { expect(camera.projection.fov).toEqual(45); });
    it("should have near 0.1", function() { expect(camera.projection.near).toEqual(0.1); });
    it("should have far 500", function() { expect(camera.projection.far).toEqual(500); });
    it("should have width 2048", function() { expect(camera.projection.width).toEqual(2048); });
    it("should have height 1024", function() { expect(camera.projection.height).toEqual(1024); });
  });
  
  describe("ortho projection", function() {
    beforeEach(function() { camera.ortho({left:-1,right:2,top:3,bottom:-4,near:0.1,far:500}); });
    
    it("should have left -1", function() { expect(camera.projection.left).toEqual(-1); });
    it("should have right 2", function() { expect(camera.projection.right).toEqual(2); });
    it("should have top 3", function() { expect(camera.projection.top).toEqual(3); });
    it("should have bottom -4", function() { expect(camera.projection.bottom).toEqual(-4); });
    it("should have near 0.1", function() { expect(camera.projection.near).toEqual(0.1); });
    it("should have far 500", function() { expect(camera.projection.far).toEqual(500); });
  });
  
  it("should set and get position accurately", function() {
    camera.position = [20, 0, 20];
    expect(camera.position).toEqualVector([20,0,20]);
    var matr = camera.getTransformationMatrix();
    expect(matr[12]).toEqual(20);
    expect(matr[13]).toEqual(0);
    expect(matr[14]).toEqual(20);
  });
  
  it("should lookAt the origin without losing position", function() {
    camera.position = [20, 0, 20];
    expect(camera.position).toEqualVector([20,0,20]);
    camera.lookAt([0,0,0]);
    expect(camera.position).toEqualVector([20,0,20]);
  });
  
  it("should set view relative to position", function() {
    camera.position = [10, 10, 10];
    camera.direction = [-1, 0, 0];
    
    expect(camera.position).toEqualVector([10,10,10]);
    expect(camera.direction).toEqualVector([-1,0,0]);
    expect(camera.up).toEqualVector([0,1,0]);
  });
  
  describe("orienting the camera after translation", function() {
    beforeEach(function() {
      camera.position = [100,100,100];
      camera.direction = [0, 0, -1];
    });
    
    it("should not change its position", function() { expect(camera.position).toEqualVector([100,100,100]); });
    
  });
  
  it("should rotate", function() {
    camera.rotate(Math.PI, 1,0,0); // 180 deg, we're now pointing backwards
    expect(camera.direction).toEqualVector([0,0,1]);
  });
  
  it("should look at a position", function() {
    camera.lookAt([10, 10, 10], [12, 10, 10]);
    expect(camera.position).toEqualVector([12,10,10]);
    expect(camera.direction).toEqualVector([-1,0,0]);
  });
  
  describe("orientation", function() {
    it(" pos(0,0,1), view(0,-1,0)", function() {
      camera.position = [0,0,1];
      camera.direction = [0,-1,0];
      expect(camera.direction).toEqualVector([0,-1,0]);
    });
  });

  describe("looking", function() {
    beforeEach(function() { camera.lookAt([0,0,-1], [0,0,0]); });
    
    it("should return position accurately", function() {
      expect(camera.position).toEqualVector([0,0,0]);
    });

    it("should return view accurately", function() {
      expect(camera.direction).toEqualVector([0,0,-1]);
    });

    it("should return up accurately", function() {
      expect(camera.up).toEqualVector([0,1,0]);
    });

    it("should return right accurately", function() {
      expect(camera.right).toEqualVector([1,0,0]);
    });
  });
  
  it("should set the position using a vector", function() {
    camera.position = [1,1,1];
    expect(camera.position).toEqualVector([1,1,1]);
  });
  
  describe("orienting the camera with numeric arguments and no position", function() {
    beforeEach(function() {
      camera.direction = [0, 0, 1];
    });
    
    it("position should be 0,0,0", function() { expect(camera.position).toEqualVector([0,0,0]);      });
    it("view should be 0,0,1",     function() { expect(camera.direction).toEqualVector([0, 0, 1]);  });
  });
  
  it("should strafe right", function() {
    camera.strafe(10);
    expect(camera.position).toEqualVector([10, 0, 0]);
  });

  it("should strafe left", function() {
    camera.strafe(-10);
    expect(camera.position).toEqualVector([-10, 0, 0]);
  });
  
  it("should move forward", function() {
    camera.move(10);
    expect(camera.position).toEqualVector([0,0,-10]);
  });
  
  it("should move backward", function() {
    camera.move(-10);
    expect(camera.position).toEqualVector([0,0,10]);
  });
  
  it("should move 'forward' along a given vector", function() {
    camera.move(10, [0,1,0]);
    expect(camera.position).toEqualVector([0,10,0]);
  });
  
  it("should move 'backward' along a given vector", function() {
    camera.move(-10, [0,1,0]);
    expect(camera.position).toEqualVector([0,-10,0]);
  });

  describe("events", function() {
    beforeEach(function() {
      spyOn(camera, 'fireEvent').andCallThrough();
    });
    
    it("should fire 'updated' when position= called", function() {
      camera.position = [1, 1, 1];
      expect(camera.fireEvent).toHaveBeenCalledWith('updated');
    });
    
    it("should fire 'updated' when orient called", function() {
      camera.direction = [ 0, 0, -1 ];
      expect(camera.fireEvent).toHaveBeenCalledWith('updated');
    });
  });
});