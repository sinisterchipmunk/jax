//= require "core/events"
//= require "scene"

/**
 * class Jax.Camera
 * includes Jax.Events.Methods
 *
 * Every object in Jax has a Camera associated with it, and is usually referred to simply
 * as +camera+. Manipulating an object's camera is to manipulate the orientation of the
 * object itself within the world.
 *
 * You can add event listeners to Jax.Camera to monitor its matrices for changes. Whenever
 * a matrix changes, the object's orientation has been modified, so this is a good way to
 * keep track of changes to an object's orientation. Add listeners like so:
 *
 *     obj = new Jax.Model( ... );
 *     obj.camera.addEventListener('matrixUpdated', function() {
 *       // the object's orientation has changed
 *     });
 *
 * Note that no arguments are passed into the event listener in this case.
 *
 * See Jax.Events for more information about event listeners.
 *
 **/
Jax.Camera = (function() {
  var LOCAL_VIEW = [0,0,-1], LOCAL_UP = [0,1,0], LOCAL_RIGHT = [1,0,0];
  
  // used in tandem with _tmp[], see below
  var POSITION = 0, VIEW = 1, RIGHT = 2, UP = 3, FORWARD = 4, SIDE = 5;
  
  /*
    handles storing data in the private _vecbuf, which is used solely to prevent
    unnecessary allocation of temporary vectors. Note that _vecbuf is used for many
    operations and data persistence not guaranteed (read: improbable).
   */
  function store(self, buftype) {
    if (arguments.length == 2) {
      // no x,y,z given -- find it
      return storeVecBuf(self, buftype);
    }
    var buf = self._tmp[buftype];
    buf[0] = arguments[2];
    buf[1] = arguments[3];
    buf[2] = arguments[4];
    return buf;
  }
  
  function tmpRotQuat(self) {
    return self._rotquat = self._rotquat || quat4.create();
  }
  
  function storeVecBuf(self, buftype) {
    var world = self.rotation;
    
    var position = (self._tmp[POSITION]);
    var result   = (self._tmp[buftype]);
    
    vec3.set(self.position, position);

    switch(buftype) {
      case POSITION:
        // we already have the position
        return position;
        break;
      case VIEW:
        quat4.multiplyVec3(world, LOCAL_VIEW, result);
        break;
      case RIGHT:
        quat4.multiplyVec3(world, LOCAL_RIGHT, result);
        break;
      case UP:
        quat4.multiplyVec3(world, LOCAL_UP, result);
        break;
      default:
        throw new Error("Unexpected buftype: "+buftype);
    }
    return result;
  }
  
  function matrixUpdated(self) {
    // Callback fires whenever one of the camera's matrices has changed.
    // We need to use this to update other variables like normal matrix, frustum, etc,
    // but we don't actually update them here because the user may be making several
    // changes to the camera in sequence (and those updates would be useless).
    // Instead we'll mark them as out-of-date and let their respective getters do the
    // work.
    // update the normal matrix
    self.stale = true;
    self.frustum_up_to_date = false;
  }
  
  function calculateMatrices(self) {
    self.stale = false;

    var pos = storeVecBuf(self, POSITION);
    quat4.toMat4(self.rotation, self.matrices.mv);
    mat4.translate(self.matrices.mv, vec3.negate(pos), self.matrices.mv);
    mat4.inverse(self.matrices.mv);
    
    mat4.toInverseMat3(self.matrices.mv, self.matrices.n);
    mat3.transpose(self.matrices.n);
    
    self.fireEvent('matrixUpdated');
  }
  
  return Jax.Class.create({
    initialize: function() {
      /**
       * Jax.Camera#projection -> Object
       * This property is undefined until either #ortho() or #perspective() is called. After a projection matrix
       * has been initialized, this object will contain various metadata about the projection matrix, such as
       * the width and height of the viewport.
       * 
       * For orthogonal projection matrices, it contains the following information:
       *     width, height, depth
       *     left, right
       *     top, bottom
       *     near, far
       *     
       * For perspective projection matrices, it contains the following information:
       *     width, height
       *     near, far
       *     fov (in degrees)
       *     
       * Note that this information is here for reference only; modifying it will in no way modify the projection
       * matrix itself. (For that, you need to make another call to #ortho() or #perspective().) Therefore,
       * changing this object's properties is not recommended because doing so would no longer accurately reflect
       * the parameters of the real projection matrix.
       * 
       * Subsequent calls to #perspective() or #ortho() will cause this object to be regenerated. Because of this,
       * it is not recommended to store any persistent data in this object.
       **/
      
      /* used for temporary storage, just to avoid repeatedly allocating temporary vectors */
      this._tmp = [ vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create() ];
      
      this.rotation = quat4.create([0,0,0,1]);
      this.position = vec3.create([0,0,0]);
      
      this.matrices = { mv: mat4.identity(mat4.create()), p : mat4.identity(mat4.create()), n : mat3.create() };
      this.frustum = new Jax.Scene.Frustum(this.matrices.mv, this.matrices.p);
      
      this.addEventListener('updated', function() { matrixUpdated(this); });
      this.reset();
    },
    
    /**
     * Jax.Camera#getRotation() -> quat4
     *
     * Returns this camera's current rotation relative to the world as a quaternion.
     **/
    getRotation: function() {
      var rotquat = tmpRotQuat(this);
      quat4.set(this.rotation, rotquat);
      return rotquat;
    },

    /**
     * Jax.Camera#getFrustum() -> Jax.Scene.Frustum
     * Returns the frustum for the camera. If the frustum is out of date, it will
     * be refreshed.
     **/
    getFrustum: function() {
      if (!this.frustum_up_to_date) this.frustum.update();
      this.frustum_up_to_date = true;
      return this.frustum;
    },

    /**
     * Jax.Camera#getPosition() -> vec3
     * Returns the current world space position of this camera.
     **/
    getPosition:   function() { return vec3.create(this.position); },

    /**
     * Jax.Camera#getViewVector() -> vec3
     * Returns the view vector relative to this camera.
     **/
    getViewVector: function() { return vec3.create(storeVecBuf(this, VIEW)); },
    
    /**
     * Jax.Camera#getUpVector() -> vec3
     * Returns the up vector relative to this camera.
     **/
    getUpVector:   function() { return vec3.create(storeVecBuf(this, UP)); },
    
    /**
     * Jax.Camera#getRightVector() -> vec3
     * Returns the right vector relative to this camera.
     **/
    getRightVector:function() { return vec3.create(storeVecBuf(this, RIGHT)); },

    /**
     * Jax.Camera#ortho(options) -> undefined
     * - options (Object): the set of parameters used to calculate the projection matrix
     * 
     * Sets up an orthographic projection matrix. Objects will not appear to shrink as they grow
     * more distant from the camera in this mode. This mode is frequently used by high-precision
     * tools such as modeling programs, and is commonly found in games when rendering UIs,
     * crosshairs and the like.
     * 
     * * _top_ - the topmost coordinate visible on the scren. Defaults to 1.
     * * _left_ - the leftmost coordinate visible on the screen. Defaults to -1.
     * * _right_ - the rightmost coordinate visible on the screen. Defaults to 1.
     * * _bottom_ - the bottommost coordinate visible on the screen. Defaults to -1.
     * * _near_ - the nearest coordinate visible. Defaults to 0.01.
     * * _far_ the furthest coordinate visible. Defaults to 200.
     *   
     **/
    ortho: function(options) {
      if (typeof(options.left)   == "undefined") options.left   = -1;
      if (typeof(options.right)  == "undefined") options.right  =  1;
      if (typeof(options.top)    == "undefined") options.top    =  1;
      if (typeof(options.bottom) == "undefined") options.bottom = -1;
      if (typeof(options.far)    == "undefined") options.far    = 200;
      options.near = options.near || 0.01;
      
      mat4.ortho(options.left, options.right, options.bottom, options.top, options.near, options.far, this.matrices.p);
      this.projection = {
        width: options.right - options.left,
        height: options.top - options.bottom,
        depth: options.near - options.far,
        left: options.left,
        right: options.right,
        near: options.near,
        far: options.far,
        top: options.top,
        bottom: options.bottom
      };
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#setPosition(positionVector) -> undefined
     * - positionVector (vec3): a vector representing the new position of the camera in world coordinates.
     * Jax.Camera#setPosition(x, y, z) -> undefined
     * - x (Number): the new X coordinate in world coordinates
     * - y (Number): the new Y coordinate in world coordinates
     * - z (Number): the new Z coordinate in world coordinates
     * 
     * Sets the position of this camera.
     **/
    setPosition: function() {
      switch(arguments.length) {
        case 1: vec3.set(arguments[0], this.position); break;
        case 3: vec3.set(arguments,    this.position); break;
        default: throw new Error("Invalid arguments for Camera#setPosition");
      }
      
      this.fireEvent('updated');

      return this;
    },

    /**
     * Jax.Camera#setDirection(vector) -> Jax.Camera
     * - vector (vec3): the new direction that the camera will be pointing,
     *                  relative to the camera
     * Jax.Camera#setDirection(x,y,z) -> Jax.Camera
     * - x (Number): the X component of the direction to point in, relative to the camera
     * - y (Number): the Y component of the direction to point in, relative to the camera
     * - z (Number): the Z component of the direction to point in, relative to the camera
     **/
    setDirection: function(vector) {
      var vec;
      if (arguments.length == 3) vec = arguments;
      else vec = vec3.create(vector);
      vec3.normalize(vec);
      
      var rotquat = vec3.toQuatRotation(storeVecBuf(this, VIEW), vec, tmpRotQuat(this));
      quat4.multiply(rotquat, this.rotation, this.rotation);
      quat4.normalize(this.rotation);
      
      this.fireEvent('updated');
      return this;
    },
    
    /**
     * Jax.Camera#reorient(view[, position]) -> Jax.Camera
     * - view (vec3): the new direction, relative to the camera, that the camera will be pointing
     * - position (vec3): an optional new position for the camera, in world space.
     *
     * Reorients this camera to look in the given direction and optionally to be
     * repositioned according to the given position vector.
     *
     * Returns this camera after modification..
     **/
    reorient: function(view, pos) {
      if (pos) this.setPosition(pos);
      this.setDirection(view);
      return this;
    },
    
    /**
     * Jax.Camera#orient(viewVector, upVector[, positionVector]) -> Jax.Camera
     * - viewVector (vec3): the new direction that the camera will be pointing
     * - upVector (vec3): the new "up" direction perpendicular to the view
     * - positionVector (vec3): optionally, a new position for the camera
     * Jax.Camera#orient(vx, vy, vz, ux, uy, uz[, px, py, pz]) -> Jax.Camera
     * 
     * Reorients this camera to be looking in the specified direction.
     * Optionally, repositions this camera.
     *
     * **Deprecated.** Please use Jax.Camera#setDirection instead.
     **/
    orient: function(view, up) {
      var pos = null;
      
      if (Jax.environment != Jax.PRODUCTION)
        alert("Jax.Camera#orient is deprecated. Please use Jax.Camera#reorient instead.\n\n"+new Error().stack);
      
      switch(arguments.length) {
        case 1:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = null;
          break;
        case 2:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = store(this,       UP,   up[0],   up[1],   up[2]);
          break;
        case 3:
          if (typeof(arguments[0]) == "number") {
            view = store(this,     VIEW,    arguments[0],    arguments[1],    arguments[2]);
            up = null;
          } else {
            view = store(this,     VIEW,         view[0],         view[1],         view[2]);
            up   = store(this,       UP,           up[0],           up[1],           up[2]);
            pos  = store(this, POSITION, arguments[2][0], arguments[2][1], arguments[2][2]);
          }
          break;
        case 6:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          break;
        case 9:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          pos  = store(this, POSITION, arguments[6], arguments[7], arguments[8]);
          break;
        default:
          throw new Error("Unexpected arguments for Camera#orient");
      }

      if (pos) this.setPosition(pos);
      this.setDirection(view);

      return this;
    },
    
    /**
     * Jax.Camera#lookAt(point[, pos]) -> Jax.Camera
     * point (vec3): the point, in world space, to look at
     * pos (vec3): an optional point to reposition this camera at, in world space,
     * replacing its current position
     **/
    lookAt: function(point, pos) {
      if (arguments.length > 2)
        alert("Jax.Camera#lookAt with more than 2 arguments is deprecated. Please use only two arguments: the point to look at (a vec3) and an optional point to reposition the camera to (a vec3).\n\n"+new Error().stack);
        
      if (pos) this.setPosition(pos);
      else pos = store(this, POSITION);
      
      var forward = this._tmp[FORWARD];
      this.setDirection(vec3.subtract(point, pos, forward));
    },

    /**
     * Jax.Camera#perspective(options) -> undefined
     * - options (Object): a generic object whose properties will be used to set up the
     *                     projection matrix.
     * 
     * Sets up a traditional perspective view for this camera. Objects will appear to be
     * smaller as they get further away from the camera.
     * 
     * Options include:
     *   * _width_ - the width of the camera, in pixels. Required.
     *   * _height_ - the height of the camera, in pixels. Required.
     *   * _fov_ - the angle of the field of view, in degrees. Default: 45
     *   * _near_ - the distance of the near plane from the camera's actual position. Objects
     *     closer to the camera than this will not be seen, even if they are technically in
     *     front of the camera itself. Default: 0.01
     *   * _far_ - the distance of the far plane from the camera's actual position. Objects
     *     further away from the camera than this won't be seen. Default: 200
     **/
    perspective: function(options) {
      options = options || {};
      if (!options.width) throw new Error("Expected a screen width in Jax.Camera#perspective");
      if (!options.height)throw new Error("Expected a screen height in Jax.Camera#perspective");
      options.fov  = options.fov  || 45;
      options.near = options.near || 0.01;
      options.far  = options.far  || 200;
      
      var aspect_ratio = options.width / options.height;
      mat4.perspective(options.fov, aspect_ratio, options.near, options.far, this.matrices.p);
      this.projection = {
        width: options.width, height: options.height,
        near: options.near,   far: options.far,
        fov: options.fov
      };
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#getTransformationMatrix() -> mat4
     * 
     * Returns the transformation matrix. This matrix represents the camera's position and
     * orientation in the world.
     **/
    getTransformationMatrix: function() {
      if (this.stale) calculateMatrices(this);
      return this.matrices.mv;
    },

    /**
     * Jax.Camera#getProjectionMatrix() -> mat4
     * 
     * Returns the projection matrix. This matrix represents the projection of the world
     * onto a screen.
     **/
    getProjectionMatrix: function() { return this.matrices.p; },

    /**
     * Jax.Camera#getNormalMatrix() -> mat3
     * 
     * Returns the normal matrix, which is defined as the transpose of the inverse of the
     * transformation matrix.
     * 
     * This matrix is commonly used in lighting calculations.
     **/
    getNormalMatrix: function() {
      if (this.stale) calculateMatrices(this);
      return this.matrices.n;
    },

    /**
     * Jax.Camera#unproject(x, y[, z]) -> [[nearx, neary, nearz], [farx, fary, farz]]
     * - x (Number): X coordinate in pixels
     * - y (Number): Y coordinate in pixels
     * 
     * Calculates a line segment in world space of the given pixel location. One end of the
     * line segment represents the nearest world space point to which the pixel corresponds,
     * while the other end of the line segment represents the farthest visible point, depending
     * on the near and far planes of the projection matrix.
     * 
     * You can also find a point at an arbitrary distance by passing a third argument representing
     * the distance, Z, to travel from the near plane towards the far plane. Z should be a number
     * between 0 and 1 (so think of it as a percentage). In this form, only one set of coordinates
     * is returned: the actual world space position of the specified coordinate.
     * 
     * This function was adapted from gluUnproject(), found at
     * http://www.opengl.org/wiki/GluProject_and_gluUnProject_code
     **/
    unproject: function(winx, winy, winz) {
      // winz is either 0 (near plane), 1 (far plane) or somewhere in between.
      // if it's not given a value we'll produce coords for both.
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);
      
        var inf = [];
        var mm = this.getTransformationMatrix(), pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];
    
        //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
        var m = mat4.set(mm, mat4.create());
        
        mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
        mat4.multiply(pm, m, m);
        mat4.inverse(m, m);
    
        // Transformation of normalized coordinates between -1 and 1
        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;
    
        //Objects coordinates
        var out = vec3.create();
        mat4.multiplyVec4(m, inf, out);
        if(out[3]==0.0)
           return null;
    
        out[3]=1.0/out[3];
        return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
      }
      else
        return [this.unproject(winx, winy, 0), this.unproject(winx, winy, 1)];
    },

    /**
     * Jax.Camera#rotate(amount, x, y, z) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - x (Number): X coordinate of the axis around which to rotate
     * - y (Number): Y coordinate of the axis around which to rotate
     * - z (Number): Z coordinate of the axis around which to rotate
     * Jax.Camera.rotate(amount, vector) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - vector (vec3): vector form of the axis around which to rotate
     * 
     * Rotates the camera by the specified amount around some axis.
     **/
    rotate: function() {
      var amount = arguments[0];
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = this._tmp[0]; vec[0] = arguments[1]; vec[1] = arguments[2]; vec[2] = arguments[3];  break;
        default: throw new Error("Invalid arguments");
      }
      
      var rotquat = quat4.fromAngleAxis(amount, vec, tmpRotQuat(this));
      quat4.multiply(rotquat, this.rotation, this.rotation);
      
      this.fireEvent('updated');
      return this;
    },

    /**
     * Jax.Camera#strafe(distance) -> the translated camera
     * - distance (Number): the distance to move. If positive, the camera will move "right";
     *                      if negative, the camera will move "left".
     * 
     * Causes the camera to strafe, or move "sideways" along the right vector.
     **/
    strafe: function(distance) {
      this.move(distance, LOCAL_RIGHT);
      return this;
    },

    /**
     * Jax.Camera#move(distance[, direction]) -> the translated camera
     * - distance (Number): the distance to move. If positive, the camera will move "forward"
     *                      along the direction vector; if negative, it will move "backward".
     * - direction (vec3): the vector to move along. If not specified, this will default to
     *                     the camera's view vector. That is, it will default to the direction
     *                     the camera is pointing.
     **/
    move: function(distance, direction) {
      vec3.add(vec3.scale(direction || LOCAL_VIEW, distance, this._tmp[FORWARD]), this.position, this.position);
      this.fireEvent('updated');
      return this;
    },

    /**
     * Jax.Camera#reset() -> the reset camera
     * Resets this camera by moving it back to the origin and pointing it along the negative
     * Z axis with the up vector along the positive Y axis.
     **/
    reset: function() { this.lookAt([0,0,-1], [0,0,0]); }
  });
})();

/** alias of: Jax.Camera#setDirection
 * Jax.Camera#setViewVector(vector) -> Jax.Camera
 * - vector (vec3): the direction that the camera will be pointing,
 *                  relative to the camera
 **/
Jax.Camera.prototype.setViewVector = Jax.Camera.prototype.setDirection;

/** alias of: Jax.Camera#getRotation
 * Jax.Camera#getQuaternion() -> quat4
 **/
Jax.Camera.prototype.getQuaternion = Jax.Camera.prototype.getRotation;

Jax.Camera.addMethods(Jax.Events.Methods);
