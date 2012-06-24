#= require 'jax/webgl/core/events'
#= require 'jax/webgl/scene'

class Jax.Camera
  @include Jax.Events.Methods
  
  constructor: (options) ->
    @rotation = quat4.identity()
    @position = vec3.create()
    @matrices =
      mv:  mat4.identity()
      imv: mat4.identity()
      p:   mat4.identity()
      n:   mat3.identity()
    @frustum = new Jax.Scene.Frustum @matrices.mv, @matrices.p
    @addEventListener 'updated', => @invalidate()
    @reset()
    @setFixedYawAxis true, vec3.UNIT_Y
    @_isValid = false
    
    if options
      @setPosition  options.position if options.position
      @setDirection options.direction if options.direction
    
  invalidate: (invalidateMatrices) ->
    @_isValid = false
    @_stale and= !invalidateMatrices
    @frustum.invalidate()
    
  isValid: -> @_isValid
  
  validate: ->
    mat4.fromRotationTranslation @rotation, @position, @matrices.mv
    mat4.inverse @matrices.mv, @matrices.imv
    mat4.toInverseMat3 @matrices.mv, @matrices.n
    mat3.transpose @matrices.n
    @fireEvent 'matrixUpdated'
    
  setFixedYawAxis: (useFixedYaw, axis) ->
    @_fixedYaw = useFixedYaw
    @_fixedYawAxis = axis if axis
    
  getFrustum: ->
    @validate() unless @isValid()
    @frustum
  
  getPosition:    -> vec3.create @position
  getDirection:   -> @getViewVector()
  getViewVector:  -> quat4.multiplyVec3 @rotation, [0, 0,-1], vec3.create()
  getRightVector: -> quat4.multiplyVec3 @rotation, [1, 0, 0], vec3.create()
  getUpVector:    -> quat4.multiplyVec3 @rotation, [0, 1, 0], vec3.create()
  
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
    
  setPosition: (x, y, z) ->
    if y is undefined
      vec3.set x, @position
    else
      @position[0] = x
      @position[1] = y
      @position[2] = z
    @invalidate true
    @fireEvent 'updated'
    
  _dirVec = vec3.create()
  _dirRightVec = vec3.create()
  _dirUpVec = vec3.create()
  _dirQuat = quat4.create()
  setDirection: (dir) ->
    vec = vec3.set dir, _dirVec
    vec3.scale vec, -1
    vec3.normalize vec
    if @_fixedYaw
      right = vec3.normalize vec3.cross @_fixedYawAxis, vec, _dirRightVec
      up    = vec3.normalize vec3.cross vec, right, _dirUpVec
      quat4.fromAxes vec, right, up, @rotation
    else
      rotquat = vec3.toQuatRotation @getViewVector(), vec, _dirQuat
      quat4.multiply rotquat, @rotation, @rotation
    quat4.normalize @rotation
    @fireEvent 'updated'
    this
    
  setViewVector: (dir) -> @setDirection dir
    
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
    @fireEvent 'updated'
    this
    
  pitch: (amount) ->
    axis = @getRightVector()
    @rotateWorld amount, axis
    
  yaw: (amount) ->
    if @_fixedYaw
      axis = @_fixedYawAxis
    else
      axis = @getUpVector()
    @rotateWorld amount, axis
  
  roll: (amount) ->
    axis = @getViewVector()
    @rotateWorld amount, axis
    
  reorient: (view, pos) ->
    if pos then @setPosition pos
    @setDirection view
    this
    
  lookAt: (point, pos) ->
    if pos then @setPosition pos
    else pos = @getPosition()
    view = @getViewVector()
    @setDirection vec3.subtract point, pos, view
    
  getTransformationMatrix: ->
    @validate() unless @isValid()
    @matrices.mv
    
  getInverseTransformationMatrix: ->
    @validate() unless @isValid()
    @matrices.imv
  
  getNormalMatrix: ->
    @validate() unless @isValid()
    @matrices.n
    
  getProjectionMatrix: ->
    @validate() unless @isValid()
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
    @move distance, @getRightVector()
    this
    
  _moveVec = vec3.create()
  move: (distance, direction) ->
    direction or= @getViewVector()
    vec3.add vec3.scale(direction, distance, _moveVec), @position, @position
    @fireEvent 'updated'
    this
    
  projectMovement: (forward, strafe, dest) ->
    strafe or= 0
    dest or= vec3.create()
    
    view = vec3.scale @getViewVector(), forward
    right = vec3.scale @getRightVector(), strafe
    vec3.set @position, dest
    vec3.add view, dest, dest
    vec3.add right, dest, dest
    return dest
    
  reset: ->
    @position[0] = @position[1] = @position[2] = 0
    @rotation[0] = @rotation[1] = @rotation[2] = 0
    @rotation[3] = 1
    @fireEvent 'updated'
