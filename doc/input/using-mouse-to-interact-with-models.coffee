###
If WebGL is enabled, the thumbnails to the left of each description will be directly generated, in realtime, by the code snippets to the right -- so you can rest assured that that the examples are accurate. (If WebGL is not enabled, you'll have to take my word for it.)

## Setup

In each of the following examples, this code is evaluated as part of the scene set-up. This code is only used to help set up the scene, and isn't specific to any one example.
###
@context.gl.disable GL_CULL_FACE
@activeCamera.position = [0, 0, 3]
@world.ambientColor = '#000'
@light = @world.addLight new Jax.Light.Point
  position: [0, 0, 2]
  shadows: false
  attenuation:
    constant: 0
    linear: 0.25
    quadratic: 0
  color:
    ambient: '#000'
    specular: '#000'
    diffuse: '#fff'


###
## Picking

Picking is the process of taking screen-space pixel coordinates and
finding out what 3D object lies underneath. This is different from
unprojection in that only the entire object can be returned: picking
is generally faster (depending on the scene), but cannot be converted
into a 3D point in space.

<canvas />

Move the mouse over the object to light it up.

###
@light.enabled = false
@world.addObject new Jax.Model
  mesh: new Jax.Mesh.Teapot
  update: (tc) -> @camera.yaw tc

@update = ->
  if @world.pick @mouse_x or 0, @mouse_y or 0
    @light.enabled = true
  else
    @light.enabled = false

@mouse_moved = (e) ->
  [@mouse_x, @mouse_y] = [e.x, e.y]


###
## Unprojection

An alternative to picking is unprojection. This is somewhat slower
because it isn't hardware accelerated, but it allows you to convert
a pixel coordinate into a precise location in 3D space. This is
done by _projecting_ a ray out from the camera at the point clicked.
The two points of the resultant line segment correspond to the pixel's
world coordinates at the near and far planes of the camera.

<canvas />

Click on the object to light it up; click elsewhere to darken it.

###
@light.enabled = false
@sphere = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Sphere
    slices: 8
    stacks: 8
  update: (tc) -> @camera.yaw tc

@mouse_pressed = (e) ->
  ray = @activeCamera.unproject e.x, e.y
  direction = vec3.subtract [], ray[1], ray[0]
  @light.enabled = false
  @sphere.mesh.eachTriangle (tri) =>
    if tri.intersectRay(ray[0], direction, dest = [])
      console.log "Point clicked: [#{dest[0]}, #{dest[1]}, #{dest[2]}] (distance: #{dest[3]})"
      @light.enabled = true
  null
