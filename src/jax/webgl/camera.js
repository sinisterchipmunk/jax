//= require "core/events"

/**
 * class Jax.Camera
 **/
Jax.Camera = (function() {
  // used in tandem with _vecbuf, see below
  var POSITION = 0, VIEW = 1, RIGHT = 2, UP = 3;
  
  /*
    handles storing data in the private _vecbuf, which is used solely to prevent
    unnecessary allocation of temporary vectors. Note that _vecbuf is used for many
    operations and data persistence not guaranteed (read: improbable).
   */
  function storeVecBuf(self, buftype) {
    switch(buftype) {
      case POSITION:
        self._vecbuf[0] = self.matrices.mv[12];
        self._vecbuf[1] = self.matrices.mv[13];
        self._vecbuf[2] = self.matrices.mv[14];
        break;
      case VIEW:
        self._vecbuf[0] = self.matrices.mv[2];
        self._vecbuf[1] = self.matrices.mv[6];
        self._vecbuf[2] = self.matrices.mv[10];
        vec3.negate(self._vecbuf);
        break;
      case RIGHT:
        self._vecbuf[0] = self.matrices.mv[0];
        self._vecbuf[1] = self.matrices.mv[4];
        self._vecbuf[2] = self.matrices.mv[8];
        break;
      case UP:
        self._vecbuf[0] = self.matrices.mv[1];
        self._vecbuf[1] = self.matrices.mv[5];
        self._vecbuf[2] = self.matrices.mv[9];
        break;
      default:
        throw new Error("Unexpected buftype: "+buftype);
    }
    return self._vecbuf;
  }
  
  function matrixUpdated(self) {
    // update the normal matrix
    mat4.transpose(mat4.inverse(self.matrices.mv, self.matrices.n), self.matrices.n);
  }
  
  /*
    m[0]  m[4]  m[ 8]  m[12]
    m[1]  m[5]  m[ 9]  m[13]
    m[2]  m[6]  m[10]  m[14]
    m[3]  m[7]  m[11]  m[15]
   */
  return Jax.Class.create({
    initialize: function() {
      /* used for temporary storage, just to avoid repeatedly allocating temporary vectors */
      this._vecbuf = vec3.create();
      this.matrices = { mv: mat4.create(), p : mat4.create(), n : mat4.create() };
      this.addEventListener('matrixUpdated', function() { matrixUpdated(this); });
      this.reset();
    },

    /**
     * Jax.Camera#getPosition() -> vec3
     * Returns the current world space position of this camera.
     **/
    getPosition:   function() { return vec3.create(storeVecBuf(this, POSITION)); },

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
      this.matrices.p.width = options.right - options.left;
      this.matrices.p.height= options.top - options.bottom;
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
      var vec = vec3.create();
      switch(arguments.length) {
        case 1: vec3.set(arguments[0], vec); break;
        case 3: vec3.set(arguments,    vec); break;
        default: throw new Error("Invalid arguments for Camera#setPosition");
      }
      this.matrices.mv[12] = vec[0];
      this.matrices.mv[13] = vec[1];
      this.matrices.mv[14] = vec[2];
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#orient(viewVector, upVector[, positionVector]) -> undefined
     * - viewVector (vec3): the new direction that the camera will be pointing
     * - upVector (vec3): the new "up" direction perpendicular to the view
     * - positionVector (vec3): optionally, a new position for the camera
     * Jax.Camera#orient(vx, vy, vz, ux, uy, uz[, px, py, pz]) -> undefined
     * 
     * Reorients this camera to be looking in the specified direction.
     * Optionally, repositions this camera.
     **/
    orient: function() {
      switch(arguments.length) {
        case 2: mat4.lookAt(storeVecBuf(this, POSITION), arguments[0], arguments[1], this.matrices.mv); break;
        case 3: mat4.lookAt(arguments[2], arguments[0], arguments[1], this.matrices.mv); break;
        case 6: mat4.lookAt(storeVecBuf(this, POSITION),
                            [arguments[0], arguments[1], arguments[2]],
                            [arguments[3], arguments[4], arguments[5]],
                            this.matrices.mv); break;
        case 9: mat4.lookAt([arguments[6], arguments[7], arguments[8]],
                            [arguments[0], arguments[1], arguments[2]],
                            [arguments[3], arguments[4], arguments[5]],
                            this.matrices.mv); break;
        default: throw new Error("Invalid arguments for Camera#orient");
      }
      this.fireEvent('matrixUpdated');
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
      this.matrices.p.width = options.width;
      this.matrices.p.height = options.height;
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#getModelViewMatrix() -> mat4
     * 
     * Returns the ModelView matrix. This matrix represents the camera's position and
     * orientation in the world.
     **/
    getModelViewMatrix: function() { return this.matrices.mv; },

    /**
     * Jax.Camera#getProjectionMatrix() -> mat4
     * 
     * Returns the projection matrix. This matrix represents the projection of the world
     * onto a screen.
     **/
    getProjectionMatrix: function() { return this.matrices.p; },

    /**
     * Jax.Camera#getNormalMatrix() -> mat4
     * 
     * Returns the normal matrix, which is defined as the transpose of the inverse of the
     * ModelView matrix.
     * 
     * This matrix is commonly used in lighting calculations.
     **/
    getNormalMatrix: function() { return this.matrices.n; },

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
        var mm = this.matrices.mv, pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];
    
        //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
        
        var m = mat4.multiply(pm, mm, mat4.create());
        mat4.inverse(m);
    
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
      var amount = arguments.shift();
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = vec3.create(arguments); break;
        default: throw new Error("Invalid arguments");
      }
      
      if      (vec[1] == 0 && vec[2] == 0) mat4.rotateX(this.matrices.mv, amount*vec[0], this.matrices.mv);
      else if (vec[0] == 0 && vec[2] == 0) mat4.rotateY(this.matrices.mv, amount*vec[1], this.matrices.mv);
      else if (vec[0] == 0 && vec[1] == 0) mat4.rotateZ(this.matrices.mv, amount*vec[2], this.matrices.mv);
      else                                 mat4.rotate (this.matrices.mv, amount,   vec, this.matrices.mv);
      this.fireEvent('updatedMatrix');
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
      mat4.translate(this.matrices.mv, vec3.scale(storeVecBuf(this, RIGHT), distance), this.matrices.mv);
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
      direction = direction || storeVecBuf(this, VIEW);
      mat4.translate(this.matrices.mv, vec3.scale(direction, distance), this.matrices.mv);
    },

    /**
     * Jax.Camera#reset() -> the reset camera
     * Resets this camera by moving it back to the origin and pointing it along the negative
     * Z axis with the up vector along the positive Y axis.
     **/
    reset: function() { this.orient([0,0,-1],[0,1,0],[0,0,0]); }
  });
})();

Jax.Camera.addMethods(Jax.Events.Methods);
