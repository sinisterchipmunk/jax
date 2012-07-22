###
If WebGL is enabled, the thumbnails to the left of each description will be directly generated, in realtime, by the code snippets to the right -- so you can rest assured that that the examples are accurate. (If WebGL is not enabled, you'll have to take my word for it.)

## Setup

In each of the following examples, this code is evaluated as part of the scene set-up. This code is only used to help set up the scene, and isn't specific to any one example.
###
@world.ambientColor = '#fff'
@cube = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.LineCube
    size: 2
    color: [ Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5, 1]
  position: [0, 0, -5]


###
## [Perspective Projection](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L127)

<canvas />

The default type of projection used by cameras in Jax is _perspective_. With this projection, objects appear to shrink as they become more distant. This is the type of projection that most closely resembles the human eye, with a default field of view of 45 degrees.

Take care when setting the `near` and `far` values. If the difference between `far` and `near` is too great, the depth buffer will become imprecise, causing issues such as [Z-fighting](http://en.wikipedia.org/wiki/Z-fighting).

The default values for `near` and `far` in Jax are 0.1 and 200, respectively.
###
@cube.update = (tc) -> @camera.yaw tc

@activeCamera.perspective
  width: @context.canvas.clientWidth
  height: @context.canvas.clientHeight
  near: 0.1
  far: 10
  fov: 45


###
## [Orthographic Projection](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L106)

<canvas />

The other type of projection supported by cameras in Jax is _orthographic_. With this type of projection, objects do not seem to shrink as they grow more distant. This is unrealistic, but can be very useful in certain circumstances, particularly when drawing aspects of the user interface.
###
@cube.update = (tc) -> @camera.yaw tc

@activeCamera.ortho
  left: -3
  right: 3
  bottom: -2
  top: 2
  near: 0.1
  far: 10


###
## [Moving](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L253)

<canvas />

You can move a camera by simply passing the distance to be moved into the `move` function. Optionally, you can specify a unit vector to move in relation to, which defaults to the camera's current direction. A positive number will move in the direction of the vector, while a negative number will move opposite the direction.
###
@direction = 1
@update = (tc) ->
  if @activeCamera.position[2] < -1 then @direction = -1
  else if @activeCamera.position[2] > 1 then @direction = 1
  @activeCamera.move tc * 1.5 * @direction


###
## [Strafing](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L248)

<canvas />

Strafing is similar to moving, but instead of moving the camera forward (positive) or backward (negative), the camera is moved right (positive) or left (negative).
###
@direction = -1
@update = (tc) ->
  if @activeCamera.position[0] < -1 then @direction = 1
  else if @activeCamera.position[0] > 1 then @direction = -1
  @activeCamera.strafe tc * 1.5 * @direction


###
## [Local Rotation](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L147)

<canvas />

Local rotation means to rotate the camera about some axis relative to its current orientation. Rotation about the specified axis will not modify the local axis itself, but will modify the two axes perpendicular to it.
###
@cube.camera.position = [-5, 0, 0]
@activeCamera.lookAt [-1, 0, 0]
@update = (tc) ->
  @activeCamera.rotate tc * 0.5, [0, 0, 1]


###
## [Absolute (World) Rotation](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L156)

<canvas />

Absolute rotation will rotate the camera about some axis given _in world space_. Thus, the camera's local orientation has no effect on the specified axis.
###
@cube.update = null
@cube.camera.position = [-5, 0, 0]
@activeCamera.lookAt [-1, 0, 0]
@update = (tc) ->
  @activeCamera.rotateWorld tc * 2, [0, 0, 1]


###
## [Pitch](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L170)

<canvas />

Pitching will rotate the camera about its local X axis, resulting in a vertical rotation. A positive number rotates the camera upward, while a negative number pitches downward.
###
@direction = 1
@update = (tc) ->
  if @activeCamera.direction[1] < -0.5 then @direction = 1
  else if @activeCamera.direction[1] > 0.5 then @direction = -1
  @activeCamera.pitch tc * @direction


###
## [Yaw](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L174)

<canvas />

Yawing will rotate the camera about its yaw axis, which is normally its Y axis. The result is a horizontal rotation. A positive number rotates the camera toward its "left", and a negative number rotates toward its "right".
###
@direction = 1
@update = (tc) ->
  if @activeCamera.direction[0] < -0.5 then @direction = -1
  else if @activeCamera.direction[0] > 0.5 then @direction = 1
  @activeCamera.yaw tc * @direction


###
## [Roll](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L181)

<canvas />

Rolling produces a rotation about the camera's local Z axis, such that it's still pointing at the same object but its relative "up" direction has changed. A positive number will result in a counter-clockwise roll, and a negative number will result in a clockwise roll.
###
@direction = 1
@update = (tc) ->
  if @activeCamera.direction[0] < -0.5 then @direction = -1
  else if @activeCamera.direction[0] > 0.5 then @direction = 1
  @activeCamera.roll tc * @direction


###
## [Reorienting](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L185)

<canvas />

You can use the _reorient_ method to set the camera's position and absolute view direction at the same time, in world space, regardless of its current orientation. This is useful if you know the exact position and direction it should be facing, and don't necessarily know or care about its current heading.
###
rotation = 0
@cube.camera.position = [0, 0, 0]

@update = (tc) ->
  rotation += tc
  x = Math.cos rotation
  y = 0
  z = Math.sin rotation
  # look at the calculated direction, and set position according
  # to the negated direction, so we should always be looking
  # at the origin
  @activeCamera.reorient [x, y, z], [-x * 5, -y * 5, -z * 5]


###
## [Looking At](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/camera.js.coffee#L190)

<canvas />

If you know the position that you want to look at, you don't need to calculate a view vector toward that position. Instead of using `reorient`, use `lookAt` to look at an exact position in world space. In this case, the second argument is the camera's new `position`, and is optional. If not given, the camera will look at the specified point without being repositioned.
###
rotation = 0
@cube.camera.position = [0, 0, 0]

@update = (tc) ->
  rotation += tc
  x = Math.cos rotation
  y = 0
  z = Math.sin rotation
  # orbit the origin, but always look at it.
  @activeCamera.lookAt [0, 0, 0], [-x * 5, -y * 5, -z * 5]


###
## [Multiple Cameras](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/world.js.coffee#L64)

<canvas />

Jax manages an array of cameras for you to take advantage of. By default, the array only contains a single camera. You can add more by simply assigning the number of cameras you need to the array. By default, @activeCamera references the first camera in the array. To switch views, simply assign @activeCamera to the camera you need to activate.
###
@cube.update = (tc) -> @camera.yaw tc

@world.cameras = 2
@world.cameras[0].lookAt [0, 0, -5], [0, 0, 5]
@world.cameras[1].lookAt [0, 0, -5], [0, -5, -5]

timer = 2
camera = 0
@update = (tc) ->
  timer -= tc
  if timer < 0
    timer = 2
    @activeCamera = @world.cameras[++camera % 2]


