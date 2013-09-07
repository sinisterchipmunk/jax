#= require tween
#= require 'jax/mixins/event_emitter'
#= require 'jax/mixins/attributes'
#= require_self
#= require_tree './camera'

# HACK Might be a bug in glmatrix, I have to negate `view` for this to work
quat.setAxes = do ->
    matr = mat3.create()

    (out, view, right, up) ->
      matr[0] = right[0]
      matr[3] = right[1]
      matr[6] = right[2]

      matr[1] = up[0]
      matr[4] = up[1]
      matr[7] = up[2]

      matr[2] = -view[0]
      matr[5] = -view[1]
      matr[8] = -view[2]

      quat.normalize out, quat.fromMat3 out, matr


###

The following **read-only** attributes are available:

  - `mat4 matrix`
  - `mat4 inverseMatrix`
  - `mat4 inverseConcatenatedMatrices`
  - `mat3 normalMatrix`
  - `mat3 inverseNormalMatrix`
  - `vec3 position`
  - `vec3 up`
  - `vec3 right`
  - `vec3 direction`
  - `quat rotation`

NOTE: You should never try to assign values to these attributes. You should
only ever use the methods exposed by `Jax.Camera` to interact with its
attributes, and you should never modify the contents of the objects that
are returned by `get`.

###
class Jax.Camera
  @include Jax.Mixins.EventEmitter
  @include Jax.Mixins.Attributes

  @getter 'frustum', ->
    @_frustum or= new Jax.Frustum @get('inverseMatrix'), @get('projection').matrix
    # the gets are necessary to ensure both matrices are up-to-date
    @get 'inverseMatrix'
    @get 'projection'
    @_frustum.validate()
    @_frustum

  # pre-allocate temporary variables for reuse -- these should never be
  # exposed to consumers
  _unitX = vec3.clone [1, 0,  0]
  _unitY = vec3.clone [0, 1,  0]
  _unitZ = vec3.clone [0, 0, -1]
  _view = vec3.create()
  _quat = quat.create()
  _rotMat = mat4.create()
  _origin = vec3.create()
  _position = vec3.create()
  _lookAtDirection = vec3.create()
  _worldAxis = vec3.create()
  _animvec = vec3.create()
  _unprojectInf = vec4.create()
  _viewport = vec4.create()
  _unprojmat = mat4.create()
  _norm = vec3.create()

  # Alias overridden mixins for faster lookup
  _get = Jax.Mixins.Attributes.get

  # flags used to track stale data, so that we aren't recalculating values
  # unnecessarily
  FLAGS =
    matrix                     : 0x001
    inverseMatrix              : 0x002
    position                   : 0x004
    up                         : 0x008
    right                      : 0x010
    direction                  : 0x020
    rotation                   : 0x040
    normalMatrix               : 0x080
    inverseNormalMatrix        : 0x100
    inverseConcatenatedMatrices: 0x200

  constructor: (opts = {}) ->
    @initializeAttributes()
    @activeAnimations = {}
    @animationQueues = {}
    @_time = 0
    @set 'matrix',                      mat4.identity mat4.create()
    @set 'inverseMatrix',               mat4.identity mat4.create()
    @set 'normalMatrix',                mat3.identity mat3.create()
    @set 'inverseNormalMatrix',         mat3.identity mat3.create()
    @set 'inverseConcatenatedMatrices', mat4.identity mat4.create()
    @set 'position',                    vec3.create()
    @set 'up',                          vec3.clone [0, 1,  0]
    @set 'right',                       vec3.clone [1, 0,  0]
    @set 'direction',                   vec3.clone [0, 0, -1]
    @set 'rotation',                    quat.identity quat.create()
    @set 'projection',
      type: 'identity'
      matrix: mat4.identity mat4.create()
    @on 'animation:update', @animationUpdated
    @reset()

    # TODO just `set` each option?
    if opts.position  then @setPosition  opts.position
    if opts.direction then @setDirection opts.direction

  ###
  Event listener that is called whenever an animation is updated. This may
  be called many times per frame, depending on how many animations are active
  at the same time.
  ###
  animationUpdated: (newState) =>
    {startRotation, endRotation, rotationOpts} = newState
    currentPosition = @get 'position'
    newPosition = null
    if (x = newState.positionX) isnt undefined
      newPosition = _animvec
      newPosition[0] = x
      newPosition[1] = newState.positionY
      newPosition[2] = newState.positionZ

    if lerpAmount = newState.rotationLerpAmount
      matrix = @attributes.matrix
      currentRotation = @attributes.rotation
      if newState.slerp
        quat.slerp currentRotation, startRotation, endRotation, lerpAmount
      else
        quat.lerp  currentRotation, startRotation, endRotation, lerpAmount
      # quat.multiply currentRotation, currentRotation, startRotation
      mat4.fromRotationTranslation matrix, currentRotation, newPosition || currentPosition
      # since we already know the new matrix, no reason to mark it stale
      # also, we know the new position (if any) from above
      @set 'matrix', matrix
      @set 'rotation', currentRotation
      @stale |= FLAGS.inverseMatrix | FLAGS.up | FLAGS.direction |
                FLAGS.right | FLAGS.normalMatrix | FLAGS.inverseNormalMatrix |
                FLAGS.position | FLAGS.inverseConcatenatedMatrices
      @_frustum?.invalidate()
    else if newPosition
      @setPosition newPosition

    if newState.facing
      @setDirection @calcDirection _animvec, newState.facing

  ###
  Animates one or more aspects of this camera's orientation according to the
  options given.

  Example (from a controller):

      index: ->
        @target = @world.addObject new Model()

      click: ->
        # begin the animation when a mouse button is clicked:
        @activeCamera.animate
          position: [ 10, 0, -10 ]
          facing: @target.camera.get('position')
          easing: TWEEN.Easing.Back.InOut
          duration: 1500

  If an animation is already in progress, the new one will be queued up and
  played after the current one finishes. Pass the `queue` option to alter
  this behavior.

  ## Options

  The following options can be passed to `animate`:

  - `position` : animates the position of this camera, moving toward the
                 specified point, which must be a `vec3` in world space.

  - `rotation` : a rotation quaternion representing the final state of this
                 camera. This can be combined with the `position` option, but
                 not with the `direction`, `facing`, `right` or `up` options.

  - `facing`   : animates the view direction of this camera such that it is
                 always facing in the direction of the specified point, given
                 in world space. The view direction is no longer updated after
                 the animation's duration expires.

  - `direction`: animates the view direction of this camera, ending the
                 animation such that `get('direction')` returns a vector equal
                 to the specified `vec3`.

  - `right`    : animates the right-vector of this camera. This has a similar
                 effect to the `direction` option, and can be combined with
                 other options for more precise control over the camera's
                 final orientation.

  - `up`       : animates the up-vector of this camera. This has a similar
                 effect to the `direction` option, and can be combined with
                 other options for more precise control over the camera's
                 final orientation.

  - `duration` : the duration of this animation, in milliseconds. Defaults to
                 `1000`, or 1 second.

  - `slerp`    : whether to use spherical linear interpolation for the
                 directional vectors. Defaults to `true`. If `false`, the
                 faster but less accurate normalized linear interpolation is
                 used instead. Set this to `false` if you are starting an
                 animation with a small rotation, `true` for large ones.

  - `queue`    : which queue to use for the animation. Defaults to
                 `"default"`. Animations in the same queue must wait until
                 the one preceding them has completed. Animations in separate
                 queues can run simultaneously.

  - `easing`   : the camera easing algorithm. Defaults to
                 `TWEEN.Easing.Linear.None`. Can be any of the TWEEN easing
                 functions, or any function accepting an `elapsed` number
                 and returning a number.

    - `interpolation` : the interpolation algorithm. This is not the same as
                the `slerp` option. Rather, this controls the interpolation of
                the interpolation amount itself. Defaults to
                `TWEEN.Interpolation.Linear`. Can be any of the TWEEN
                interpolation functions, or any function accepting `end` and
                `current` numbers and returning a number.

  ###
  animate: (opts) ->
    if opts.rotation
      if opts.direction || opts.facing || opts.right || opts.up
        throw new Error "Can't animate toward directional vectors AND a rotation quaternion -- choose one or the other"
    else
      if opts.direction && opts.facing
        throw new Error "Can't animate toward view vector AND reference point -- choose one or the other"

    queue = @animationQueues[opts.queue or 'default'] or= []
    queue.push opts
    this

  ###
  Updates the animations tied to this camera, and accepts the next animation
  from the queue if necessary.
  ###
  update: (tc) ->
    time = @_time += tc * 1000

    # update any animations in progress -- we do this first to prevent any
    # animation from receiving an update when the time difference would be 0
    for queueName, animation of @activeAnimations
      delete @activeAnimations[queueName] unless animation.update time

    # pull animations from their queues if necessary
    for queueName, queue of @animationQueues
      if queue.length && !@activeAnimations[queueName]
        @activeAnimations[queueName] = @createAnimation queue.shift()
        @activeAnimations[queueName].start time

    this

  ###
  Calculates a quaternion from the given options, inferring values from the
  current state of the camera as needed depending on which options are
  specified. For example, if a new `up` vector is given but nothing else,
  the other axes are inferred from a quaternion rotation leading from the
  current `up` vector. If all axes are given, then the result is the exact
  quaternion representing those axes. The acceptable options are:

  - `direction`
  - `up`
  - `right`

  The result is placed in `out` and returned.

  Each option given is assumed to be of unit length, and is not normalized
  automatically. To produce a valid result, you should ensure the vectors
  have been normalized prior to calling this method.
  ###
  calcRotation: (out, opts) ->
    if opts.direction
      if opts.up && opts.right
        quat.setAxes out, opts.direction, opts.right, opts.up
      else
        if opts.up
          vec3.normalize _animvec, vec3.cross _animvec, opts.direction, opts.up
          quat.setAxes out, opts.direction, _animvec, opts.up
        else if opts.right
          vec3.normalize _animvec, vec3.cross _animvec, opts.right, opts.direction
          quat.setAxes out, opts.direction, opts.right, _animvec
        else
          quat.rotationTo out, @get('direction'), opts.direction
          quat.multiply out, out, @get('rotation')
    else
      # need to calculate a direction based on other supplied parameters
      if opts.up && opts.right
        # up and right were given, direction is a cross product and final
        # quat is simply a matrix of these
        vec3.normalize _animvec, vec3.cross _animvec, opts.up, opts.right
        quat.setAxes out, _animvec, opts.right, opts.up
      else
        # not enough information to maintain axes, create a quaternion
        # from the current vector to the destination vector that may
        # introduce drift
        if opts.up
          quat.rotationTo out, @get('up'), opts.up
        else if opts.right
          quat.rotationTo out, @get('right'), opts.right
        # convert the rotation quat into a final state quat by multiplying
        # current rotation state
        quat.multiply out, out, @get('rotation')
    out

  ###
  Creates and returns an animation object instance. See `animate` for options.
  ###
  createAnimation: (opts) ->
    duration      = 1000
    easing        = TWEEN.Easing.Linear.None
    interpolation = TWEEN.Interpolation.Linear
    slerp         = true
    duration      = opts.duration      if opts.duration      isnt undefined
    easing        = opts.easing        if opts.easing        isnt undefined
    interpolation = opts.interpolation if opts.interpolation isnt undefined
    slerp         = opts.slerp         if opts.slerp         isnt undefined

    [start, end] = [{}, {}]
    # normalize all the rotational/directional options into a single
    # quaternion, or `null` if no such options were given.
    newRotation = null
    if opts.rotation
      newRotation = opts.rotation
    if opts.facing
      start.facing = opts.facing
    if opts.direction || opts.up || opts.right
      newRotation = @calcRotation quat.create(), opts
      start.rotationOpts = opts
    
    if newRotation
      start.slerp = slerp
      start.startRotation = quat.clone @get 'rotation'
      start.endRotation   = newRotation
      start.rotationLerpAmount = 0
      end.rotationLerpAmount = 1
    if opts.position
      currentPosition = @get 'position'
      endPosition     = opts.position
      start.positionX = currentPosition[0]
      start.positionY = currentPosition[1]
      start.positionZ = currentPosition[2]
      end.positionX   = endPosition[0]
      end.positionY   = endPosition[1]
      end.positionZ   = endPosition[2]

    self = this
    tween = new TWEEN.Tween start
    tween.to end, duration
    tween.easing easing
    tween.interpolation interpolation
    tween.onUpdate   -> self.trigger 'animation:update',   this
    tween.onStart    -> self.trigger 'animation:start',    this
    tween.onComplete -> self.trigger 'animation:complete', this
    tween

  ###
  Overridden from `Jax.Mixins.Attributes` in order to check for stale state
  on the requested attribute. If the attribute is stale, its value is
  recalculated before it is returned. If it is not stale or if there is no
  corresponding flag for the attribute, the value is returned unchanged.
  ###
  get: (k) ->
    value = _get.call this, k
    if flag = FLAGS[k]
      if @stale & flag
        @stale ^= flag
        @recalculate k, value
      else
        value
    else
      value

  SET_ROTATION_FLAGS = FLAGS.inverseMatrix | FLAGS.up | FLAGS.right | FLAGS.direction |
                       FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  setRotation: (newRotation) ->
    rotation = @attributes.rotation
    quat.copy rotation, newRotation
    @set 'rotation', rotation
    position = @get 'position'
    matrix = @attributes.matrix
    @set 'matrix', mat4.fromRotationTranslation matrix, rotation, position
    @stale |= SET_ROTATION_FLAGS
    this

  ###
  If the given attribute `k` is recognized, this method recalculates the value
  and stores it in the `value` vector. The attribute's value is also assigned,
  so this method will also trigger the appropriate `change` events.

  The `value` vector is returned.

  This method is called automatically to keep the various camera attributes
  in sync.
  ###
  recalculate: (k, value) ->
    switch k
      when 'matrix'
        @set 'matrix',              mat4.invert value, @get('inverseMatrix')
      when 'inverseMatrix'
        @set 'inverseMatrix',       mat4.invert value, @get('matrix')
      when 'position'
        @set 'position',            @transformEye3 value, _origin
      when 'right'
        @set 'right',               @rotateEye3 value, _unitX
      when 'up'
        @set 'up',                  @rotateEye3 value, _unitY
      when 'direction'
        @set 'direction',           @rotateEye3 value, _unitZ
      when 'rotation'
        @set 'rotation',            quat.setAxes value, @get('direction'),
                                                        @get('right'),
                                                        @get('up')
      when 'normalMatrix'
        @set 'normalMatrix',        mat3.normalFromMat4 value, @get 'matrix'
      when 'inverseNormalMatrix'
        @set 'inverseNormalMatrix', mat3.normalFromMat4 value, @get 'inverseMatrix'
      when 'inverseConcatenatedMatrices'
        mm = @get 'inverseMatrix'
        pm = @get('projection').matrix
        mat4.multiply value, pm, mm
        unless mat4.invert value, value
          throw new Error("Can't calculate inverse of concatenated matrices")

    value

  ###
  Unprojects a point from screen coordinates to a position in world space.
  The `winz` value should be a number within 0..1, where 0 is on the near
  plane and 1 is on the far plane.
  ###
  unprojectPoint: (out, winx, winy, winz) ->
    inf = _unprojectInf
    projection = @get 'projection'
    viewport = _viewport

    switch projection.type
      when 'orthographic'
        [ viewport[0], viewport[1], viewport[2], viewport[3] ] =
          [ projection.left, projection.bottom, projection.right, projection.top ]
      when 'perspective'
        [ viewport[0], viewport[1], viewport[2], viewport[3] ] =
          [ 0, 0, projection.width, projection.height ]

    m = @get 'inverseConcatenatedMatrices'

    # Transformation of normalized coordinates between -1 and 1
    inf[0] =  ( winx - viewport[0]) / viewport[2] * 2 - 1
    inf[1] = -((winy - viewport[1]) / viewport[3] * 2 - 1)
    inf[2] = 2 * winz - 1
    inf[3] = 1
    
    # Objects coordinates
    vec4.transformMat4 inf, inf, m
    return null if inf[3] is 0
    
    inf[3] = 1 / inf[3]
    out[0] = inf[0] * inf[3]
    out[1] = inf[1] * inf[3]
    out[2] = inf[2] * inf[3]
    return out

  ###
  Unprojects two points from screen coordinates to produce a ray in world
  space. The ray's first element is the unprojected point with `winzNear`,
  and the second element is the unprojected point with `winzFar`. By default
  these are points on the near and far planes, respectively.
  ###
  unprojectLineSegment: (out, winx, winy, winzNear = 0, winzFar = 1) ->
    @unproject out[0], winx, winy, winzNear
    @unproject out[1], winx, winy, winzFar
    out

  ###
  Resets this camera to its original state, positioned at the origin and
  looking down the negative Z axis in world space.
  ###
  reset: ->
    @stale = FLAGS.inverseMatrix | FLAGS.position | FLAGS.up | FLAGS.right |
             FLAGS.direction | FLAGS.rotation | FLAGS.normalMatrix |
             FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
    @_frustum?.invalidate()
    @set 'matrix', mat4.identity @get('matrix')
    this

  ###
  Produces an orthographic projection for this camera. The following
  information will be stored in the `projection` attribute and returned:

      - width
      - height
      - depth
      - left
      - right
      - top
      - bottom
      - near
      - far
      - type (always 'orthographic')
      - matrix

  ###
  orthoDefaults = 
      left  :  -1
      right :   1
      top   :   1
      bottom:  -1
      near  : 0.1
      far   : 200
  ortho: (options) ->
    proj = @get('projection')
    $.extend proj, orthoDefaults, proj, options
    proj.width  = proj.right - proj.left
    proj.height = proj.top - proj.bottom
    proj.depth  = proj.far - proj.near
    proj.type   = 'orthographic'
    mat4.ortho proj.matrix, proj.left, proj.right, proj.bottom, proj.top, proj.near, proj.far
    @set 'projection', proj
    @_frustum?.invalidate()
    this

  ###
  Produces a perspective projection for this camera. The following information
  will be stored in the `projection` attribute and returned:

      - width
      - height
      - depth
      - fov
      - aspectRatio
      - near
      - far
      - type (always 'perspective')
      - matrix

  ###
  perspectiveDefaults =
    near: 0.1
    far: 200
    fov: 0.765398 # 45 degrees in radians
  perspective: (options) ->
    throw new Error "Expected a screen width in Jax.Camera#perspective" unless options?.width
    throw new Error "Expected a screen height in Jax.Camera#perspective" unless options?.height
    proj = @get 'projection'
    $.extend proj, perspectiveDefaults, proj, options
    proj.width       = options.width
    proj.height      = options.height
    proj.depth       = proj.far - proj.near
    proj.aspectRatio = proj.width / proj.height
    proj.type        = 'perspective'
    mat4.perspective proj.matrix, proj.fov, proj.aspectRatio, proj.near, proj.far
    @set 'projection', proj
    @_frustum?.invalidate()
    this

  ###
  Returns the normalized directional vector from the camera's current position
  to the specified point, in world space. The point itself should be a `vec3`
  given in world space.
  ###
  calcDirection: (out, point) ->
    @transformEye3 out, _origin
    vec3.subtract out, point, out
    vec3.normalize out, out
    out

  ###
  Analogous to the classic `gluLookAt`, this method takes an `eye` position,
  a reference `point`, and an `up` vector. It repositions the camera at the
  world-space `eye` position, orients the camera so that its local positive Y
  axis is in the world-space direction of `up`, and points the camera toward
  the world-space position of `point`.
  ###
  LOOK_AT_FLAGS = FLAGS.matrix | FLAGS.up | FLAGS.right | FLAGS.direction |
                  FLAGS.rotation | FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  lookAt: (eye, point, up) ->
    m = @get 'inverseMatrix'
    @set 'inverseMatrix', mat4.lookAt m, eye, point, up
    @set 'position', vec3.copy @attributes.position, eye
    @stale |= LOOK_AT_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Sets the direction of the camera to face in the specified direction, which
  is a directional `vec3` given in world space. If the vector is not of unit
  length, it will be normalized.

  Note: this is a fairly expensive operation.

  Note: If `up` is given, it is used to calculate the new `right` vector.
  To prevent camera drift, specify a constant up vector (e.g. `[0, 1, 0]`).
  ###
  SET_DIRECTION_FLAGS = FLAGS.inverseMatrix | FLAGS.normalMatrix |
                        FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  setDirection: (newDir, up) ->
    view = @attributes.direction
    magSq = vec3.dot(newDir, newDir)
    if magSq - 1 > Math.EPSILON
      # not unit vector, normalize it
      vec3.scale _norm, newDir, 1 / magSq
    else if magSq == 0
      [_norm[0], _norm[1], _norm[2]] = [0, 0, -1]
    else
      vec3.copy _norm, newDir
    if up
      right = @attributes.right
      up = vec3.copy @attributes.up, up

      vec3.copy view, _norm
      vec3.normalize right, vec3.cross right, _norm, up
      vec3.normalize up,    vec3.cross up, right, _norm

      rotation = quat.setAxes @attributes.rotation, view, right, up
      matrix = mat4.fromRotationTranslation @attributes.matrix, rotation, @get('position')

      @set 'matrix', matrix
      @set 'direction', view
      @set 'right', right
      @set 'up', up
      @set 'rotation', rotation
      @stale |= SET_DIRECTION_FLAGS
    else
      rotation = quat.rotationTo _quat, @get('direction'), _norm
      @rotateQuat rotation
      @set 'direction', vec3.copy view, _norm
      @stale ^= FLAGS.direction
    this

  ###
  Sets the position of this camera to the value given by the `vec3` in world
  space.
  ###
  SET_POSITION_FLAGS = FLAGS.inverseMatrix | FLAGS.position | FLAGS.normalMatrix |
                       FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  setPosition: (newPos) ->
    m = @get 'matrix'
    m[12] = newPos[0]
    m[13] = newPos[1]
    m[14] = newPos[2]
    m[15] = 1
    @set 'matrix', m
    @stale |= SET_POSITION_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Rotates the camera by the specified quaternion rotation.
  ###
  ROTATE_QUAT_FLAGS = FLAGS.inverseMatrix | FLAGS.up | FLAGS.right | FLAGS.direction |
                      FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  rotateQuat: (newRotation) ->
    rotMat = mat4.fromRotationTranslation _rotMat, newRotation, _origin
    matrix = @get 'matrix'
    rotation = @get 'rotation'
    @set 'matrix', mat4.multiply matrix, matrix, rotMat
    @set 'rotation', quat.multiply rotation, newRotation, rotation
    @stale |= ROTATE_QUAT_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Rotates about an arbitrary axis, which is a `vec3` given in eye space.
  ###
  ROTATE_FLAGS = FLAGS.inverseMatrix | FLAGS.up | FLAGS.right | FLAGS.direction |
                 FLAGS.rotation | FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  rotate: (n, axis) ->
    m = @get 'matrix'
    @set 'matrix', mat4.rotate m, m, n, axis
    @stale |= ROTATE_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Rotates about an arbitrary axis, which is a `vec3` given in world space.
  ###
  rotateWorld: (n, axis) ->
    @transformWorld3 _worldAxis, axis
    @rotate n, _worldAxis

  ###
  Moves the camera `n` units forward or backward relative to its current
  orientation. A positive `n` moves forward, while a negative `n` moves
  backward. Returns this camera.
  ###
  MOVE_FLAGS = FLAGS.inverseMatrix | FLAGS.position | FLAGS.normalMatrix |
               FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  move: (n) ->
    n = -n
    m = @get 'matrix'
    [x, y, z, w] = [m[8] * n, m[9] * n, m[10] * n, m[11] * n]
    m[12] += x
    m[13] += y
    m[14] += z
    m[15] += w
    @set 'matrix', m
    @stale |= MOVE_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Strafes the camera by moving `n` units along its local X axis (from side to
  side). A positive `n` moves right, in the direction of the camera's right
  vector. A negative `n` moves left. Returns this camera.
  ###
  STRAFE_FLAGS = FLAGS.inverseMatrix | FLAGS.position | FLAGS.normalMatrix |
                 FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  strafe: (n) ->
    m = @get 'matrix'
    [x, y, z, w] = [m[0] * n, m[1] * n, m[2] * n, m[3] * n]
    m[12] += x
    m[13] += y
    m[14] += z
    m[15] += w
    @set 'matrix', m
    @stale |= STRAFE_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Translates this camera by the specified `vec3` in eye space.
  ###
  TRANSLATE_FLAGS = FLAGS.inverseMatrix | FLAGS.position | FLAGS.normalMatrix |
                    FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  translate: (vec) ->
    m = @get 'matrix'
    @set 'matrix', mat4.translate m, m, vec
    @stale |= TRANSLATE_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Yaws the camera by the specified number of radians. This is equivalent
  to turning left (positive) or right (negative).

  Note: yawing can produce a phenomenon known as camera drift. Camera drift
  is mathematically correct, but can be undesirable in certain cases such as
  a first-person perspective. In those cases, use `rotateWorld` to rotate
  about an arbitrary axis, and specify a constant axis such as `[0, 1, 0]`.
  ###
  YAW_FLAGS = FLAGS.inverseMatrix | FLAGS.right | FLAGS.direction |
              FLAGS.rotation | FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  yaw: (n) ->
    m = @get 'matrix'
    @set 'matrix', mat4.rotateY m, m, n
    @stale |= YAW_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Rolls the camera by the specified number of radians.
  ###
  ROLL_FLAGS = FLAGS.inverseMatrix | FLAGS.right | FLAGS.up | FLAGS.rotation |
               FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  roll: (n) ->
    m = @get 'matrix'
    @set 'matrix', mat4.rotateZ m, m, n
    @stale |= ROLL_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Pitches the camera up (positive) or down (negative).
  ###
  PITCH_FLAGS = FLAGS.inverseMatrix | FLAGS.up | FLAGS.direction |
                FLAGS.rotation | FLAGS.normalMatrix | FLAGS.inverseNormalMatrix | FLAGS.inverseConcatenatedMatrices
  pitch: (n) ->
    m = @get 'matrix'
    @set 'matrix', mat4.rotateX m, m, n
    @stale |= PITCH_FLAGS
    @_frustum?.invalidate()
    this

  ###
  Transforms the `vec3` given in eye space by this camera's orientation. The
  result, placed in `out` and returned, is a `vec3` representing the same
  point in world space.

  Example:

      @camera.transformEye3(out, [0, 0, -1])
      #=> returns the camera's forward direction vector in world space

  ###
  transformEye3: (out, a) ->
    vec3.transformMat4 out, a, @get 'matrix'

  ###
  Applies this camera's rotation to the given directional `vec3`, but not its
  position. The result is a vector representing the same direction in world
  space. This is equivalent to multiplying by the camera's normal matrix.
  ###
  rotateEye3: (out, a) ->
    vec3.transformMat3 out, a, @get 'normalMatrix'

  ###
  Transforms the `vec4` given in eye space by this camera's orientation. The
  result, placed in `out` and returned, is a `vec4` representing the same
  point in world space.
  ###
  transformEye4: (out, a) ->
    vec4.transformMat4 out, a, @get 'matrix'

  ###
  Transforms the `vec3` given in world space by the inverse of this camera's
  orientation. The result, placed in `out` and returned, is a `vec3`
  representing the same point in eye space.
  ###
  transformWorld3: (out, a) ->
    vec3.transformMat4 out, a, @get 'inverseMatrix'

  ###
  Applies the inverse of this camera's rotation to the given directional
  `vec3`, but not its position. The result is a vector representing the same
  direction in eye space. This is equivalent to multiplying by the camera's 
  inverse normal matrix.
  ###
  rotateWorld3: (out, a) ->
    vec3.transformMat3 out, a, @get 'inverseNormalMatrix'

  ###
  Transforms the `vec4` given in world space by the inverse of this camera's
  orientation. The result, placed in `out` and returned, is a `vec4`
  representing the same point in eye space.
  ###
  transformWorld4: (out, a) ->
    vec4.transformMat4 out, a, @get 'inverseMatrix'
