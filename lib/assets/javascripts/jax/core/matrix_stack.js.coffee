###
A matrix stack, obviously. Every Jax.Context allocates its own matrix stack,
so you probably shouldn't have to instantiate this directly.

Note that for performance reasons, whenever you call get[Some]Matrix(), the
matrix instance itself is returned instead of a copy of the instance.
Although this gives you the technical power to make changes directly to the
returned matrix, that would be a Bad Idea (TM) because matrices that depend
upon the one you just modified will be unaware of the changes, and this will
make the other matrices inaccurate.

For example, it would be very easy to use mat4.multiply() to change the Model
matrix. In doing so, the ModelView matrix would no longer be accurate. This
could lead to very difficult-to-debug situations.

It is _strongly_ recommended to use the various matrix methods found in
Jax.MatrixStack to modify the matrices here. This will keep all related
matrices up-to-date, and it doesn't cost anything in terms of performance
because the corresponding calculations are performed lazily, rather than
eagerly.
###
class Jax.MatrixStack
  TYPES = [ 'model', 'view', 'projection', 'inverseModel', 'inverseView',
            'inverseProjection', 'normal', 'viewNormal', 'modelNormal',
            'inverseViewNormal', 'modelView', 'modelViewProjection',
            'inverseModelView']
  
  constructor: ->
    @maxDepth = 0
    @valid =
      # model, view, and projection are always valid;
      # everything else depends on them.
      inverseModel: [true]
      normal: [true]
      inverseView: [true]
      viewNormal: [true]
      modelNormal: [true]
      inverseViewNormal: [true]
      modelView: [true]
      inverseModelView: [true]
      inverseProjection: [true]
      modelViewProjection: [true]
    @matrices =
      model:               [mat4.identity mat4.create()]
      inverseModel:        [mat4.identity mat4.create()]
      normal:              [mat3.identity mat3.create()]
      modelNormal:         [mat3.identity mat3.create()]
      view:                [mat4.identity mat4.create()]
      inverseView:         [mat4.identity mat4.create()]
      viewNormal:          [mat3.identity mat3.create()]
      inverseViewNormal:   [mat3.identity mat3.create()]
      modelView:           [mat4.identity mat4.create()]
      inverseModelView:    [mat4.identity mat4.create()]
      projection:          [mat4.identity mat4.create()]
      inverseProjection:   [mat4.identity mat4.create()]
      modelViewProjection: [mat4.identity mat4.create()]
    @reset()
      
  ###
  Resets the stack depth to zero, effectively undoing all calls to #push().
  ###
  reset: ->
    @depth = 0
  
  ###
  Saves the state of all current matrices, so that further operations won't affect them directly.
  If another set of matrices already exist, they are used; otherwise, a new set is allocated.
  After a set of matrices has been secured, all current values are copied into the set.
  
  See also Jax.MatrixStack#pop()
  ###
  push: ->
    @depth++
    if @depth > @maxDepth
      for type, stack of @matrices
        while stack.length <= @depth
          stack.push new Float32Array stack[stack.length-1]
      for type, stack of @valid
        while stack.length <= @depth
          stack.push stack[stack.length-1]
      @maxDepth = @depth
    @loadModelMatrix      @matrices.model[@depth-1]
    @loadViewMatrix       @matrices.view[@depth-1]
    @loadProjectionMatrix @matrices.projection[@depth-1]
    true
    
  ###
  Reverts back to an earlier matrix stack, effectively undoing any changes that have been made
  since the most recent call to Jax.MatrixStack#push().
  *
  See also Jax.MatrixStack#push()
  ###
  pop: ->
    if @depth < 1 then @depth = 1
    @depth--
  
  ###
  Replaces the current model matrix with the specified one.
  Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the
  normal matrix.
  ###
  loadModelMatrix: (other) ->
    @valid.inverseModel[@depth] = false
    @valid.normal[@depth] = false
    @valid.modelNormal[@depth] = false
    @valid.modelView[@depth] = false
    @valid.inverseModelView[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.copy @getModelMatrix(), other
    
  ###
  Replaces the current view matrix with the specified one.
  Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the
  normal matrix.
  ###
  loadViewMatrix: (other) ->
    @valid.inverseView[@depth] = false
    @valid.viewNormal[@depth] = false
    @valid.inverseViewNormal[@depth] = false
    @valid.modelView[@depth] = false
    @valid.inverseModelView[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.copy @getViewMatrix(), other
    
  ###
  Replaces the current projection matrix with the specified one.
  Updates the inverse projection matrix.
  ###
  loadProjectionMatrix: (other) ->
    @valid.inverseProjection[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.copy @getProjectionMatrix(), other
    
  ###
  Multiplies the current model matrix with the specified one.
  Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the
  normal matrix.
  ###
  multModelMatrix: (other) ->
    @valid.inverseModel[@depth] = false
    @valid.normal[@depth] = false
    @valid.modelNormal[@depth] = false
    @valid.modelView[@depth] = false
    @valid.inverseModelView[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.multiply @getModelMatrix(), @getModelMatrix(), other
  
  ###
  Multiplies the current view matrix with the specified one.
  Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the
  normal matrix.
  ###
  multViewMatrix: (other) ->
    @valid.inverseView[@depth] = false
    @valid.viewNormal[@depth] = false
    @valid.inverseViewNormal[@depth] = false
    @valid.modelView[@depth] = false
    @valid.inverseModelView[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.multiply @getViewMatrix(), @getViewMatrix(), other

  ###
  Multiplies the current projection matrix with the specified one.
  Updates the inverse projection matrix.
  ###
  multProjectionMatrix: (other) ->
    @valid.inverseProjection[@depth] = false
    @valid.modelViewProjection[@depth] = false
    mat4.multiply @getProjectionMatrix(), @getProjectionMatrix(), other

  ###
  The local model transformation matrix. Most models will manipulate this matrix.
  Multiplying an object-space coordinate by this matrix will result in a world-space coordinate.
  ###
  getModelMatrix: ->
    @matrices.model[@depth]
    
  ###
  AKA the camera matrix. Multiplying a point in world space against the view matrix
  results in a point in eye space (e.g. relative to the eye, with the eye at the origin).
  ###
  getViewMatrix: ->
    @matrices.view[@depth]
  
  ###
  AKA the screen matrix. Multiplying a point in eye space against the projection matrix results in a 4D
  vector in clip space. Dividing clip coordinates (XYZ) by the 4th component (W) yields a 3D vector in
  normalized device coordinates, where all components are in the range [-1,1]. These points are ultimately
  multiplied by screen dimensions to find a pixel position.
  ###
  getProjectionMatrix: ->
    @matrices.projection[@depth]
    
  ###
  A combination of both model and view
  matrices, equivalent to mat4.multiply(view, model).
  
  Multiplying a point in object space by this matrix will effectively skip the world space transformation,
  resulting in a coordinate placed directly into eye space. This has the obvious advantage of being faster
  than performing the operation in two steps (model and then view).
  ###
  getModelViewMatrix: ->
    if @valid.modelView[@depth]
      return @matrices.modelView[@depth]
    else
      @valid.modelView[@depth] = true
      mat4.multiply @matrices.modelView[@depth], @getViewMatrix(), @getModelMatrix()
      
  ###
  The opposite of the modelview matrix. Multiplying an eye-space coordinate by this matrix results in an
  object-space coordinate.
  ###
  getInverseModelViewMatrix: ->
    if @valid.inverseModelView[@depth]
      return @matrices.inverseModelView[@depth]
    else
      @valid.inverseModelView[@depth] = true
      mat4.invert @matrices.inverseModelView[@depth], @getModelViewMatrix()

  ###
  Returns the model, view and projection matrices combined into one. Multiplying a point in
  object space by this matrix results in a point in clip space. This is the fastest way to
  produce 3D graphics and is the best candidate if you don't care about the intermediate spaces.
  ###
  getModelViewProjectionMatrix: ->
    if @valid.modelViewProjection[@depth]
      return @matrices.modelViewProjection[@depth]
    else
      @valid.modelViewProjection[@depth] = true
      mat4.multiply @matrices.modelViewProjection[@depth], @getProjectionMatrix(), @getModelViewMatrix()
    
  ###
  The inverse transpose of the modelview matrix. See
    http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
  for a good writeup of where and how this matrix is useful. Multiplying a 3D
  _directional_ (not _positional_) vector against this matrix will result in a
  3D _directional_ vector in eye space.
  ###
  getNormalMatrix: ->
    if @valid.normal[@depth]
      return @matrices.normal[@depth]
    else
      @valid.normal[@depth] = true
      mat3.normalFromMat4 @matrices.normal[@depth], @getModelViewMatrix()

  ###
  A 3x3 normal matrix. When a directional vector in world space is multiplied by
  this matrix, the result is a directional vector in eye (camera) space.
  ###
  getViewNormalMatrix: ->
    if @valid.viewNormal[@depth]
      return @matrices.viewNormal[@depth]
    else
      @valid.viewNormal[@depth] = true
      mat3.normalFromMat4 @matrices.viewNormal[@depth], @getViewMatrix()

  ###
  The opposite of the view matrix. Multiplying a point in eye space against this matrix
  will result in a point in world space.
  ###
  getInverseViewNormalMatrix: ->
    if @valid.inverseViewNormal[@depth]
      return @matrices.inverseViewNormal[@depth]
    else
      @valid.inverseViewNormal[@depth] = true
      mat3.normalFromMat4 @matrices.inverseViewNormal[@depth], @getInverseViewMatrix()

  ###
  A 3x3 normal matrix. When a directional vector in object space is multiplied
  by this matrix, the result is a directional vector in world space.
  ###
  getModelNormalMatrix: ->
    if @valid.modelNormal[@depth]
      return @matrices.modelNormal[@depth]
    else
      @valid.modelNormal[@depth] = true
      mat3.normalFromMat4 @matrices.modelNormal[@depth], @getModelMatrix()

  ###
  The opposite of the local model transformation matrix. Multiplying a point
  in world space against this matrix will result in an object relative to the
  current object space.
  ###
  getInverseModelMatrix: ->
    if @valid.inverseModel[@depth]
      return @matrices.inverseModel[@depth]
    else
      @valid.inverseModel[@depth] = true
      mat4.invert @matrices.inverseModel[@depth], @getModelMatrix()
      
  ###
  The opposite of the view matrix. Multiplying a point in eye space by this
  matrix will result in a point in world space.
  ###
  getInverseViewMatrix: ->
    if @valid.inverseView[@depth]
      return @matrices.inverseView[@depth]
    else
      @valid.inverseView[@depth] = true
      mat4.invert @matrices.inverseView[@depth], @getViewMatrix()
    
  ###
  The opposite of the projection matrix. Multiplying a 4D vector in normalized device coordinates by
  its 4th component will result in clip space coordinates. Multiplying these clip space coordinates by the
  inverse projection matrix will result in a point in eye space, relative to the camera.
  ###
  getInverseProjectionMatrix: ->
    if @valid.inverseProjection[@depth]
      return @matrices.inverseProjection[@depth]
    else
      @valid.inverseProjection[@depth] = true
      mat4.invert @matrices.inverseProjection[@depth], @getProjectionMatrix()
