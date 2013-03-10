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
## [Jax.Mesh.Quad](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/quad.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/quad.png' />

A Quad is a simple, unassuming square. It is made up of only two triangles, both of which face the same direction. A Quad is visible when facing towards you, but invisible when facing away, unless you call `@context.gl.disable GL_CULL_FACE`.
###
@world.addObject new Jax.Model
  mesh: new Jax.Mesh.Quad
    color: '#f00'
    size: 1
  update: (tc) -> @camera.yaw tc * 0.5
  

###
## [Jax.Mesh.Cone](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/cone.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/cone.png' />

A Cone is a cylindrical object that ends in a point. `Jax.Mesh.Cone` accepts a `sides` option representing the number of sides to the cone; 3 or 4 will produce a 3-sided or 4-sided pyramid, while more sides will produce an ever more cylindrical result. Cones with fewer than 3 sides will raise an error.
###
@light.position = [0, 0.75, 2]
@world.addObject new Jax.Model
  position: [-1.25, 0, -1]
  mesh: new Jax.Mesh.Cone
    radius: 1
    height: 1.5
    color: '#0f0'
    sides: 4
  update: (tc) -> @camera.yaw tc * 0.5
  
@world.addObject new Jax.Model
  position: [ 1.25, 0, -1]
  mesh: new Jax.Mesh.Cone
    radius: 1
    height: 1.5
    color: '#00f'
    sides: 8
  update: (tc) -> @camera.yaw tc * 0.5


###
## [Jax.Mesh.Cube](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/cube.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/cube.png' />

A Cube is a set of six Quads which together form a closed box.
###
axis = vec3.clone [1, 0.75, 0.5]
cube = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Cube
    size: 1
  update: (tc) -> @camera.rotate tc * 0.5, axis
  
cube.mesh.left.color = '#f00'
cube.mesh.right.color = '#0f0'
cube.mesh.front.color = '#00f'
cube.mesh.back.color = '#f0f'
cube.mesh.top.color = '#ff0'
cube.mesh.bottom.color = '#0ff'

###
## [Jax.Mesh.LineCube](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/line_cube.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/line-cube.png' />

A simplified Cube, in which only the 12 lines forming its edges are rendered, and the interior of each face is not filled. Essentially, this is a wireframe cube.
###
axis = vec3.clone [1, 0.75, 0.5]
cube = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.LineCube
    size: 1
    color: '#090'
  update: (tc) -> @camera.rotate tc * 0.5, axis

###
## [Jax.Mesh.Plane](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/plane.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/plane.png' />

Similar to a Quad, a Plane is essentially a giant square shape. The major difference is that a Plane is made up of any number of segments, and therefore normally consists of many more triangles than a Quad, allowing its shape to be distorted -- for example, in generating terrain.

Passing `fn` allows you to control the height (Y) value at any given (X, Z) coordinate during mesh generation. If you don't pass `fn`, Y will default to 0, producing a flat Plane.

Other options include `width` and `depth`, which override `size`; and `xSegments` and `zSegments`, which override `segments`.
###
@activeCamera.lookAt [0, 0, 0], [3, 3, 3]
@light.color.ambient = '#724'
@light.position = [0, 2, 1.5]
@light.attenuation.linear = 0.5

@world.addObject new Jax.Model
  direction: [0, 1, 0]
  mesh: new Jax.Mesh.Plane
    size: 3
    segments: 10
    color: '#0f0'
    fn: (x, z) -> Math.random() * 0.25
  update: (tc) -> @camera.rotateWorld tc * 0.5, [0, 1, 0]
  
  
###
## [Jax.Mesh.PLY](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/ply.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/ply.png' />

PLY is a model format from Stanford, designed to hold data from 3D scanners. Jax uses Ajax to load and parse PLY files, which can be in either binary or ASCII format.

The mesh will be scaled to a size of `size` GL units. The default size is 1.0.

The Ajax call will be a GET request by default. You can change this by passing the `method` option.

**NOTE:** Loading PLY files requires `DataView`, which is not implemented in Firefox until version 15. As of this writing, the latest release version is 14, so you'll need to use a nightly build, or use Chrome.
###
@world.addObject new Jax.Model
  position: [0, -1, 0]
  mesh: new Jax.Mesh.PLY
    path: '/assets/models/bun_zipper_res3.ply'
    method: 'GET'
    size: 2
  update: (tc) -> @camera.yaw tc * 0.5


###
## [Jax.Mesh.Sphere](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/sphere.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/uvsphere.png' />

A sphere created from a linear set of slices and stacks. This type of sphere is sometimes referred to as a UV Sphere, and has a tendency to cluster vertices together at the poles.

Options include `radius` which determines size and defaults to 0.5; and `slices` and `stacks`, which determine the resolution of the sphere, and each default to 8.

Increasing the number of slices and stacks will produce a more perfect sphere, at the cost of creating more polygons.
###
@world.addObject new Jax.Model
  position: [0, 0, -2]
  mesh: new Jax.Mesh.Sphere
    radius: 1.25
    slices: 16
    stacks: 16
    color: '#0ff'
  update: (tc) -> @camera.yaw tc * 0.5


###
## [Jax.Mesh.Teapot](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/teapot.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/teapot.png' />

The [Utah Teapot](http://en.wikipedia.org/wiki/Utah_teapot), useful for testing surfaces and environment maps.

`size` controls the size of the teapot (in units) and defaults to 1.0.
###
@world.addObject new Jax.Model
  position: [0, 0, -2]
  mesh: new Jax.Mesh.Teapot
    size: 2
    color: '#ff0'
  update: (tc) -> @camera.yaw tc * 0.5


###
## [Jax.Mesh.Torus](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/jax/builtin/meshes/torus.js.coffee)

<canvas data-screenshot='/assets/screenshots/builtin-meshes/torus.png' />

A ring or donut-shaped object.

A torus takes two radii, an `innerRadius` which represents the size of the tube, and an `outerRadius` which represents the distance from the center of the tube to the center of the torus. They default to `0.6` and `1.8`, respectively.

The torus can also take `sides` and `rings`, which default to `64` and `128`. These control the resolution of the torus. The higher these numbers, the smoother the torus will be, but the increase in polygon count will be more taxing on devices which must render it.
###
@world.addObject new Jax.Model
  position: [0, 0, -1.5]
  mesh: new Jax.Mesh.Torus
    innerRadius: 0.3
    outerRadius: 0.9
    sides: 32
    rings: 64
    color: '#0cf'
  update: (tc) -> @camera.rotate tc * 0.5, [1, 0.75, 0.5]
