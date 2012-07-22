###
If WebGL is enabled, the thumbnails to the left of each description will be directly generated, in realtime, by the code snippets to the right -- so you can rest assured that that the examples are accurate. (If WebGL is not enabled, you'll have to take my word for it.)

## Setup

In each of the following examples, this code is evaluated as part of the scene set-up. This code is only used to help set up the scene, and isn't specific to any one example.

## Important Notes About Shadows

By default, shadows in Jax are disabled because generating the shadow maps requires extra render passes, which can severely limit framerate if not carefully controlled. [Directional](lights.html#section-Directional_Lights) and [Spot](lights.html#section-Spot_Lights) light shadows require one extra render pass each, while [Point](lights.html#section-Point_Lights) light shadows require two passes.
###
@activeCamera.position = [-0.5, -0.5, 3.5]
@backdrop = @world.addObject new Jax.Model
  castShadow: false
  material: new Jax.Material.Surface
    intensity:
      diffuse: 3
  mesh: new Jax.Mesh.Quad
    size: 5
    color: '#fff'
  position: [0, 0, -2]

@torus = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Torus
    color: '#ff0'
    innerRadius: 0.15
    outerRadius: 0.6
  update: (tc) -> @camera.yaw tc

@sphere = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Sphere
    color: '#f00'
    radius: 0.1
    slices: 8
    stacks: 8


###
## Default Shadows

<canvas />

Shadows are normally disabled by default. The time it takes to generate the shadow maps can lower framerate, so shadows must be explicitly enabled per light source. To enable them, simply pass `shadows: true` into the constructor for your light source.
###
@world.addLight new Jax.Light.Point
  position: [0.75, 0.5, 1.25]
  shadows: true
  color:
    ambient: '#333'
    diffuse: '#fed'
    specular: '#fff'


###
## Preventing Shadows Cast

<canvas />

Sometimes, for aesthetic, performance or other reasons, you want to prevent an object from casting shadows without interfering with shadows cast by other objects. To do this, just set the model's `castShadow` property to `false`. You can also pass this option into its constructor.
###
@world.addLight new Jax.Light.Point
  position: [0.75, 0.5, 1.25]
  shadows: true
  color:
    ambient: '#333'
    diffuse: '#fed'
    specular: '#fff'
@torus.castShadow = false


###
## Preventing Shadows Received

<canvas />

Similarly to preventing an object from casting shadows, you may also want to prevent an object from _receiving_ shadows cast by other objects. In that case, simply set the model's `receiveShadow` property to `false`. You can also pass this option into its constructor.
###
@world.addLight new Jax.Light.Point
  position: [0.75, 0.5, 1.25]
  shadows: true
  color:
    ambient: '#333'
    diffuse: '#fed'
    specular: '#fff'
@backdrop.receiveShadow = false
