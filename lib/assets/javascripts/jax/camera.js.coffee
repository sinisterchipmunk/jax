#= require_self
#= require_tree './camera'

class Jax.Camera
  @include Jax.EventEmitter
  LOCAL_VIEW  = vec3.create [0, 0,-1]
  LOCAL_RIGHT = vec3.create [1, 0, 0]
  LOCAL_UP    = vec3.create [0, 1, 0]
  
  constructor: (options) ->
    @rotation = quat4.identity()
    @_position = vec3.create()
    @matrices =
      mv:  mat4.identity()
      imv: mat4.identity()
      p:   mat4.identity()
      n:   mat3.identity()
    @reset()
    @setFixedYawAxis true, vec3.UNIT_Y
    
    @_isValid = false
    @_viewVector = vec3.create()
    @_upVector   = vec3.create()
    @_rightVector= vec3.create()
    
    if options
      @_position = options.position if options.position
      @direction = options.direction if options.direction
      
  @getter 'frustum', ->
    @_frustum or= new Jax.Frustum @matrices.imv, @matrices.p
    @validate() unless @isValid()
    @recalculateMatrices() if @_stale
    @_frustum.validate() unless @_frustum.isValid()
    @_frustum

    
  _dirVec = vec3.create()
  _dirRightVec = vec3.create()
  _dirUpVec = vec3.create()
  _dirQuat = quat4.create()
  @define 'direction',
    get: ->
      @validate() unless @isValid()
      @_viewVector
    set: (dir) ->
      vec = vec3.set dir, _dirVec
      vec3.normalize vec
      if @_fixedYaw
        # FIXME why am I negating? Can't remember...
        vec3.negate vec
        right = vec3.normalize vec3.cross @_fixedYawAxis, vec, _dirRightVec
        up    = vec3.normalize vec3.cross vec, right, _dirUpVec
        quat4.fromAxes vec, right, up, @rotation
      else
        rotquat = vec3.rotationTo @direction, vec, _dirQuat
        quat4.multiply rotquat, @rotation, @rotation
      quat4.normalize @rotation
      @invalidate()
      @fireEvent 'updated'
    
  @getter 'right', ->
    @validate() unless @isValid()
    @_rightVector
    
  @getter 'up', ->
    @validate() unless @isValid()
    @_upVector
    
  @define 'position',
    get: -> @_position
    set: (x) ->
      vec3.set x, @_position
      # no need to completely invalidate, just force matrices and
      # frustum to update, that way we skip the overhead of
      # recalculating view, right and up vectors, which won't change.
      @_stale = true
      @_frustum?.invalidate()
      @fireEvent 'updated'
    
  invalidate: ->
    @_isValid = false
    @_stale = true
    @_frustum?.invalidate()
    
  isValid: -> @_isValid
  
  recalculateMatrices: ->
    @validate() unless @isValid()
    @_stale = false
    mat4.fromRotationTranslation @rotation, @position, @matrices.mv
    mat4.inverse @matrices.mv, @matrices.imv
    mat4.toInverseMat3 @matrices.mv, @matrices.n
    mat3.transpose @matrices.n
    @fireEvent 'matrixUpdated'
  
  validate: () ->
    @_isValid = true
    @_viewVector  = quat4.multiplyVec3 @rotation, LOCAL_VIEW,  @_viewVector
    @_rightVector = quat4.multiplyVec3 @rotation, LOCAL_RIGHT, @_rightVector
    @_upVector    = quat4.multiplyVec3 @rotation, LOCAL_UP,    @_upVector
    
  setFixedYawAxis: (useFixedYaw, axis) ->
    @_fixedYaw = useFixedYaw
    @_fixedYawAxis = axis if axis
    
  ortho: (options) ->
    options.left or= -1
    options.right or= 1
    options.top or= 1
    options.bottom or= -1
    options.far or= 200
    options.near or= 0.1
    mat4.ortho options.left, options.right, options.bottom, options.top, options.near, options.far, @matrices.p
    @projection =
      width: options.right - options.left
      height: options.top - options.bottom
      depth: options.far - options.near
      left: options.left
      right: options.right
      top: options.top
      bottom: options.bottom
      near: options.near
      far: options.far
      type: 'orthographic'
    @fireEvent 'matrixUpdated'
    
  perspective: (options) ->
    options or= {}
    throw new Error "Expected a screen width in Jax.Camera#perspective" unless options.width
    throw new Error "Expected a screen height in Jax.Camera#perspective" unless options.height
    options.fov or= 45
    options.near or= 0.1
    options.far or= 200
    aspectRatio = options.width / options.height
    mat4.perspective options.fov, aspectRatio, options.near, options.far, @matrices.p
    @projection =
      width: options.width
      height: options.height
      near: options.near
      far: options.far
      fov: options.fov
      type: 'perspective'
    @fireEvent 'matrixUpdated'
    
  _rotVec = vec3.create()
  _rotQuat = quat4.create()
  rotate: (amount, x, y, z) ->
    if y is undefined then vec = x
    else
      vec = _rotVec
      vec[0] = x
      vec[1] = y
      vec[2] = z
    @rotateWorld amount, quat4.multiplyVec3 @rotation, vec, vec
  
  rotateWorld: (amount, x, y, z) ->
    if y is undefined then vec = x
    else
      vec = _rotVec
      vec[0] = x
      vec[1] = y
      vec[2] = z
    rotquat = quat4.fromAngleAxis amount, vec, _rotQuat
    quat4.normalize rotquat
    quat4.multiply rotquat, @rotation, @rotation
    @invalidate()
    @fireEvent 'updated'
    this
    
  pitch: (amount) ->
    axis = @right
    @rotateWorld amount, axis
    
  yaw: (amount) ->
    if @_fixedYaw
      axis = @_fixedYawAxis
    else
      axis = @up
    @rotateWorld amount, axis
  
  roll: (amount) ->
    axis = @direction
    @rotateWorld amount, axis
    
  reorient: (view, pos) ->
    if pos then @position = pos
    @direction = view
    this
    
  lookAt: (point, pos) ->
    if pos then @position = pos
    else pos = @position
    view = @direction
    @direction = vec3.subtract point, pos, view
    
  getTransformationMatrix: ->
    @recalculateMatrices() if @_stale
    @matrices.mv
    
  getInverseTransformationMatrix: ->
    @recalculateMatrices() if @_stale
    @matrices.imv
  
  getNormalMatrix: ->
    @recalculateMatrices() if @_stale
    @matrices.n
    
  getProjectionMatrix: ->
    @recalculateMatrices() if @_stale
    @matrices.p
    
  _unprojectInf = vec4.create()
  unproject: (winx, winy, winz) ->
    # winz is either 0 (near plane), 1 (far plane) or somewhere in between.
    # if it's not given a value we'll produce coords for both.
    if winz isnt undefined
      inf = _unprojectInf
      mm = @getTransformationMatrix()
      pm = @getProjectionMatrix()
      viewport = [0, 0, @projection.width, @projection.height]
      
      # calculation for inverting a matrix, computing projection x modelview
      # then compute the inverse
      m = mat4.inverse mm, mat4.create() # WHY do I have to invert first?
      mat4.multiply pm, m, m
      return null unless mat4.inverse m, m
      
      # Transformation of normalized coordinates between -1 and 1
      inf[0] = (winx - viewport[0]) / viewport[2] * 2 - 1
      inf[1] = (winy - viewport[1]) / viewport[3] * 2 - 1
      inf[2] = 2 * winz - 1
      inf[3] = 1
      
      # Objects coordinates
      out = inf
      mat4.multiplyVec4 m, inf, out
      return null if out[3] is 0
      
      result = vec3.create()
      out[3] = 1 / out[3]
      result[0] = out[0] * out[3]
      result[1] = out[1] * out[3]
      result[2] = out[2] * out[3]
      return result
    else
      return [@unproject(winx, winy, 0), @unproject(winx, winy, 1)]
    
  strafe: (distance) ->
    @move distance, @right
    this
    
  _moveVec = vec3.create()
  move: (distance, direction) ->
    direction or= @direction
    vec3.add vec3.scale(direction, distance, _moveVec), @position, @position
    @invalidate()
    @fireEvent 'updated'
    this
    
  projectMovement: (forward, strafe, dest) ->
    strafe or= 0
    dest or= vec3.create()
    
    view = vec3.scale @direction, forward
    right = vec3.scale @right, strafe
    vec3.set @position, dest
    vec3.add view, dest, dest
    vec3.add right, dest, dest
    return dest
    
  reset: ->
    @position[0] = @position[1] = @position[2] = 0
    @rotation[0] = @rotation[1] = @rotation[2] = 0
    @rotation[3] = 1
    @invalidate()
    @fireEvent 'updated'
