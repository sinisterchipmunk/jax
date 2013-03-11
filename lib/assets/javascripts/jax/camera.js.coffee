#= require_self
#= require_tree './camera'

class Jax.Camera
  @include Jax.EventEmitter
  LOCAL_VIEW  = vec3.clone [0, 0,-1]
  LOCAL_RIGHT = vec3.clone [1, 0, 0]
  LOCAL_UP    = vec3.clone [0, 1, 0]
  
  constructor: (options) ->
    @rotation = quat.identity quat.create()
    @_position = vec3.create()
    @matrices =
      mv:  mat4.identity mat4.create()
      imv: mat4.identity mat4.create()
      p:   mat4.identity mat4.create()
      n:   mat3.identity mat3.create()
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
  _dirQuat = quat.create()
  @define 'direction',
    get: ->
      @validate() unless @isValid()
      @_viewVector
    set: (dir) ->
      vec = vec3.copy _dirVec, dir
      vec3.normalize vec, vec
      if @_fixedYaw
        # negating so that right, up, vec is right-handed
        vec3.negate vec, vec
        right = vec3.normalize _dirRightVec, vec3.cross _dirRightVec, @_fixedYawAxis, vec
        up    = vec3.normalize _dirUpVec,    vec3.cross _dirUpVec,    vec, right
        quat.setAxes @rotation, vec, right, up
      else
        rotquat = quat.rotationTo _dirQuat, @direction, vec
        quat.multiply @rotation, rotquat, @rotation
      quat.normalize @rotation, @rotation
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
      vec3.copy @_position, x
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
    mat4.fromRotationTranslation @matrices.mv, @rotation, @position
    mat4.invert @matrices.imv, @matrices.mv
    mat3.fromMat4 @matrices.n, @matrices.imv
    mat3.transpose @matrices.n, @matrices.n
    @fireEvent 'matrixUpdated'
  
  validate: () ->
    @_isValid = true
    @_viewVector  = vec3.transformQuat @_viewVector,  LOCAL_VIEW,  @rotation
    @_rightVector = vec3.transformQuat @_rightVector, LOCAL_RIGHT, @rotation
    @_upVector    = vec3.transformQuat @_upVector,    LOCAL_UP,    @rotation
    
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
    mat4.ortho @matrices.p, options.left, options.right, options.bottom, options.top, options.near, options.far
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
    options.fov or= 0.785398 # 45 degrees in radians
    options.near or= 0.1
    options.far or= 200
    aspectRatio = options.width / options.height
    mat4.perspective @matrices.p, options.fov, aspectRatio, options.near, options.far
    @projection =
      width: options.width
      height: options.height
      near: options.near
      far: options.far
      fov: options.fov
      type: 'perspective'
    @fireEvent 'matrixUpdated'
    
  _rotVec = vec3.create()
  _rotQuat = quat.create()
  rotate: (amount, x, y, z) ->
    if y is undefined then vec = x
    else
      vec = _rotVec
      vec[0] = x
      vec[1] = y
      vec[2] = z
    @rotateWorld amount, vec3.transformQuat vec, vec, @rotation
  
  rotateWorld: (amount, x, y, z) ->
    if y is undefined then vec = x
    else
      vec = _rotVec
      vec[0] = x
      vec[1] = y
      vec[2] = z
    rotquat = quat.setAxisAngle _rotQuat, vec, amount
    quat.normalize rotquat, rotquat
    quat.multiply @rotation, rotquat, @rotation
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
    @direction = vec3.subtract view, point, pos
    
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
      m = mat4.invert mat4.create(), mm # WHY do I have to invert first?
      mat4.multiply m, pm, m
      return null unless mat4.invert m, m
      
      # Transformation of normalized coordinates between -1 and 1
      inf[0] = (winx - viewport[0]) / viewport[2] * 2 - 1
      inf[1] = (winy - viewport[1]) / viewport[3] * 2 - 1
      inf[2] = 2 * winz - 1
      inf[3] = 1
      
      # Objects coordinates
      out = inf
      vec4.transformMat4 out, inf, m
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
    vec3.add @position, vec3.scale(_moveVec, direction, distance), @position
    @invalidate()
    @fireEvent 'updated'
    this
    
  _projectView = vec3.create()
  _projectRight = vec3.create()
  projectMovement: (forward, strafe, dest) ->
    strafe or= 0
    dest or= vec3.create()
    view  = _projectView
    right = _projectRight
    
    vec3.scale view, @direction, forward
    vec3.scale right, @right, strafe
    vec3.copy dest, @position
    vec3.add dest, view,  dest
    vec3.add dest, right, dest
    return dest
    
  reset: ->
    @position[0] = @position[1] = @position[2] = 0
    @rotation[0] = @rotation[1] = @rotation[2] = 0
    @rotation[3] = 1
    @invalidate()
    @fireEvent 'updated'
