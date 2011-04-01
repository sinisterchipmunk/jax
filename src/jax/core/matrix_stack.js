//= require "../vendor/glMatrix-0.9.5"
//= require "../prototype/class"

/**
 * Jax.IDENTITY_MATRIX
 * A cache of the identity matrix so that we're not constantly allocating identities.
 **/
Jax.IDENTITY_MATRIX = mat4.identity(mat4.create());

/**
 * class Jax.MatrixStack
 * 
 * A matrix stack, obviously. Every Jax.Context allocates its own matrix stack, so you probably
 * shouldn't have to instantiate this directly. Calls to methods of the same name on Jax.Context
 * are delegated into its own matrix stack, so you're really calling these methods.
 * 
 * Note that for performance reasons, whenever you call get[Some]Matrix(), the matrix instance
 * itself is returned instead of a copy of the instance. That gives you the power to make changes
 * directly to the matrix, instead of doing them via the stack. For instance, instead of calling
 * Jax.MatrixStack#loadMatrix(), you could just as easily call mat4#set() using one of the
 * matrices here as an argument. However, in doing so you will lose the auto-updating of other
 * matrices, so you must be very careful about how you modify matrices.
 *
 * For example, it would be very easy to use mat4.multiply() to change the model matrix. In doing
 * so, the inverse model matrix would no longer be accurate. This could lead to very
 * difficult-to-debug situations.
 * 
 * When in doubt, it is _strongly_ recommended to use the various matrix methods found in
 * Jax.MatrixStack to modify the matrices here. This will keep all related matrices up-to-date.
 **/
Jax.MatrixStack = (function() {
  var MODEL = 1, VIEW = 2, PROJECTION = 3;
  
  function updateModelView(self) {
    mat4.multiply(self.getInverseViewMatrix(), self.getModelMatrix(), self.getModelViewMatrix());
    mat4.inverse(self.getModelViewMatrix(), self.getInverseModelViewMatrix());
  }
  
  function updateNormal(self) {
    mat4.toMat3(self.getInverseModelViewMatrix(), self.getNormalMatrix());
    mat3.transpose(self.getNormalMatrix());
  }
  
  function mMatrixUpdated(self) {
    mat4.inverse(self.getModelMatrix(), self.getInverseModelMatrix());
    updateModelView(self);
    updateNormal(self);
  }
  
  function vMatrixUpdated(self) {
    mat4.inverse(self.getViewMatrix(), self.getInverseViewMatrix());
    updateModelView(self);
    updateNormal(self);
  }
  
  function pMatrixUpdated(self) {
    mat4.inverse(self.getProjectionMatrix(), self.getInverseProjectionMatrix());
  }
  
  function loadMatrix(self, which, values) {
    switch(which) {
      case MODEL:
        mat4.set(values, self.getModelMatrix());
        mMatrixUpdated(self);
        break;
      case VIEW:
        mat4.set(values, self.getViewMatrix());
        vMatrixUpdated(self);
        break;
      case PROJECTION:
        mat4.set(values, self.getProjectionMatrix());
        pMatrixUpdated(self);
        break;
      default: throw new Error("programming error: matrix ID not understood: "+which);
    }
  }
  
  function multMatrix(self, which, values) {
    switch(which) {
      case MODEL:
        mat4.multiply(self.getModelMatrix(), values, self.getModelMatrix());
        mMatrixUpdated(self);
        break;
      case VIEW:
        mat4.multiply(self.getViewMatrix(), values, self.getViewMatrix());
        vMatrixUpdated(self);
        break;
      case PROJECTION:
        mat4.multiply(self.getProjectionMatrix(), values, self.getProjectionMatrix());
        pMatrixUpdated(self);
        break;
      default: throw new Error("programming error: matrix ID not understood: "+which);
    }
  }
  
  /*
    iterates through each matrix stack in self.matrices and pushes a new matrix onto the stack.
    If the new matrix level already has a matrix, it is used; otherwise, a new one is allocated.
    Then, the current level's matrix values are copied into the next level's matrix.
   */
  function pushMatrix(self) {
    var current;
    var stack;
    var current_depth = self.depth;
    var type;

    self.depth++;
    for (var i in self.matrices) {
      stack = self.matrices[i];
      current = stack[current_depth];
      type = (current.length == 9 ? mat3 : mat4);
      stack[self.depth] = stack[self.depth] || type.create();
      type.set(current, stack[self.depth]);
    }
  }
  
  return Jax.Class.create({
    /**
     * Jax.MatrixStack#push() -> Jax.MatrixStack
     * 
     * Saves the state of all current matrices, so that further operations won't affect them directly.
     * If another set of matrices already exist, they are used; otherwise, a new set is allocated.
     * After a new set of matrices has been secured, all current values are copied into the new set.
     * 
     * See also Jax.MatrixStack#pop()
     **/
    push: function() { pushMatrix(this); },

    /**
     * Reverts back to an earlier matrix stack, effectively undoing any changes that have been made
     * since the most recent call to Jax.MatrixStack#push().
     **/
    pop: function() { this.depth--; },

    /**
     * Jax.MatrixStack#reset() -> Jax.MatrixStack
     * 
     * Resets the stack depth to zero, effectively undoing all calls to #push().
     **/
    reset: function() { this.depth = 0; },

    /**
     * Jax.MatrixStack#loadModelMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     * Replaces the current model matrix with the specified one.
     * Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    loadModelMatrix: function(values) { loadMatrix(this, MODEL, values); return this; },

    /**
     * Jax.MatrixStack#loadViewMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     * Replaces the current view matrix with the specified one.
     * Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    loadViewMatrix: function(values) { loadMatrix(this, VIEW, values); return this; },

    /**
     * Jax.MatrixStack#loadProjectionMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     * Replaces the current projection matrix with the specified one.
     * Updates the inverse projection matrix.
     **/
    loadProjectionMatrix: function(values) { loadMatrix(this, PROJECTION, values); return this; },

    /**
     * Jax.MatrixStack#multModelMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     * Multiplies the current model matrix with the specified one.
     * Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    multModelMatrix: function(values) { multMatrix(this, MODEL, values); return this; },

    /**
     * Jax.MatrixStack#multViewMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     * Multiplies the current view matrix with the specified one.
     * Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    multViewMatrix: function(values) { multMatrix(this, VIEW, values); return this; },

    /**
     * Jax.MatrixStack#multProjectionMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     * Multiplies the current projection matrix with the specified one.
     * Updates the inverse projection matrix.
     **/
    multProjectionMatrix: function(values) { multMatrix(this, PROJECTION, values); return this; },
    
    /**
     * Jax.MatrixStack#getModelMatrix() -> mat4
     * 
     * the local model transformation matrix. Most models will manipulate this matrix. Multiplying an object-space
     * coordinate by this matrix will result in a world-space coordinate.
     **/
    getModelMatrix: function() { return this.matrices.model[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseModelMatrix() -> mat4
     * 
     * the opposite of the local model transformation matrix. Multiplying a point in world space against this matrix
     * will result in an object relative to the current object space.
     **/
    getInverseModelMatrix: function() { return this.matrices.inverse_model[this.depth]; },

    /**
     * Jax.MatrixStack#getNormalMatrix() -> mat3
     * 
     * the inverse transpose of the modelview matrix. See
     *   http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
     * for a good writeup of where and how this matrix is useful. Multiplying a 3D _directional_ (not _positional)
     * vector against this matrix will result in a 3D _directional_ vector in eye space.
     **/
    getNormalMatrix: function() { return this.matrices.normal[this.depth]; },
    
    /**
     * Jax.MatrixStack#getViewMatrix() -> mat4
     * 
     * aka the camera matrix. Multiplying a point in eye space (e.g. relative to the camera) against the view matrix
     * results in a point in world space.
     **/
    getViewMatrix: function() { return this.matrices.view[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseViewMatrix() -> mat4
     * 
     * the opposite of the camera matrix. Multiplying a point in world space against this matrix
     * will result in a point in eye space (relative to camera).
     **/
    getInverseViewMatrix: function() { return this.matrices.inverse_view[this.depth]; },

    /**
     * Jax.MatrixStack#getModelViewMatrix() -> mat4
     * 
     * the only matrix OpenGL actually cares about, the modelview matrix. A combination of both model and view
     * matrices, equivalent to mat4.multiply(view, model). (OpenGL matrix operations are read from right-to-left.)
     * 
     * Multiplying a point in object space by this matrix will effectively skip the world space transformation,
     * resulting in a coordinate placed directly into eye space. This has the obvious advantage of being faster
     * than performing the operation in two steps (model and then view).
     **/
    getModelViewMatrix: function() { return this.matrices.modelview[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseModelViewMatrix() -> mat4
     * 
     * The opposite of the modelview matrix. Multiplying an eye-space coordinate by this matrix results in an
     * object-space coordinate.
     **/
    getInverseModelViewMatrix: function() { return this.matrices.inverse_modelview[this.depth]; },
        
    /**
     * Jax.MatrixStack#getProjectionMatrix() -> mat4
     * 
     * aka the screen matrix. Multiplying a point in eye space against the projection matrix results in a 4D
     * vector in clip space. Dividing clip coordinates (XYZ) by the 4th component (W) yields a 3D vector in
     * normalized device coordinates, where all components are in the range [-1,1]. These points are ultimately
     * multiplied by screen dimensions to find a pixel position.
     **/
    getProjectionMatrix: function() { return this.matrices.projection[this.depth]; },
        
    /**
     * Jax.MatrixStack#getInverseProjectionMatrix() -> mat4
     * 
     * the opposite of the projection matrix. Multiplying a 4D vector in normalized device coordinates by
     * its 4th component will result in clip space coordinates. Multiplying these clip space coordinates by the inverse
     * projection matrix will result in a point in eye space, relative to the camera.
     **/
    getInverseProjectionMatrix: function() { return this.matrices.inverse_projection[this.depth]; },
    
    initialize: function() {
      this.depth = 0;
      
      this.matrices = {
        /* matrix depth, essentially the array index representing the current level in the stack. */
        model: [mat4.create()],
        inverse_model: [mat4.create()],
        normal: [mat3.create()],
        view: [mat4.create()],
        inverse_view: [mat4.create()],
        modelview: [mat4.create()],
        inverse_modelview: [mat4.create()],
        projection: [mat4.create()],
        inverse_projection: [mat4.create()]
      };
      
      this.loadModelMatrix(Jax.IDENTITY_MATRIX);
      this.loadViewMatrix(Jax.IDENTITY_MATRIX);
      this.loadProjectionMatrix(Jax.IDENTITY_MATRIX); // there's no known data about the viewport at this time.
    }
  });
})();