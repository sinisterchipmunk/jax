###
## About Materials

A Material is essentially a description of what an object looks like, and what special visual properties it may have. It contains information about how hard or soft it is, its color, and how reflective it is. Materials directly influence the representation of a 3D object on-screen, and without them, the objects are just globs of data.

## Materials in Jax

In Jax, there are several classes which each represent a _type_ of material. For example, `Jax.Material.Surface` represents a hard surface, and `Jax.Material.Wire` represents a surface which is hard near its edges, but the interior of each face is an open window.

You will see many examples here of materials that are instantiated directly via JavaScript. There's nothing wrong with this approach, and there are cases where it is preferable, but most of the time you'll want to take advantage of the command-line generators and resultant `.yml` files Jax provides. This helps keep your presentation layer separate from your business logic.

## WebGL

If WebGL is enabled, the thumbnails to the left of each description will be directly generated, in realtime, by the code snippets to the right -- so you can rest assured that that the examples are accurate. (If WebGL is not enabled, you'll have to take my word for it.)
###


###
## Setup

In each of the following examples, this code is evaluated as part of the scene set-up. This code is only used to help set up the scene, and isn't specific to any one example.
###
mesh = new Jax.Mesh.Teapot()
@world.addObject new Jax.Model
  position: [0, 0, -2]
  mesh: mesh
  update: (tc) -> @camera.yaw tc
light = @world.addLight new Jax.Light.Directional
  direction: [-1, -1, -1]
  color:
    diffuse: '#fff'
    specular: '#fff'


###
## The Default Material

<canvas />

If you are using the `.yml` files generated for you by Jax, then you can simply assign the name of the material (which is the same as its file name, without the `.yml` extension) to any mesh in order to use it. By default, if no material is specified, the material named `"default"` is implicitly assigned.
###
mesh.material = "default"


###
## [Jax.Material.Surface](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/material/surface.js.coffee)

<canvas />

In most cases, this is the material class you're looking for. It is a simple, flat, hard surface.

The `intensity` options are effectively multipliers, influencing each of the components affected by light sources. By altering these numbers, you can alter how meshes which use this material reflect light.

The `shininess` option makes the material more or less reflective. A lower value will produce a less reflective surface like dirt or wood, while a higher value will produce a more reflective surface like chrome or diamond.

Unlike light sources, the `color` properties may have an alpha component. If so, the material becomes translucent.

The `pcf` option defaults to `true` and enables or disables percentage-closer filtering, which is used to smooth out shadows. If a light doesn't have shadows enabled, this option has no effect.
###
light.color.ambient = '#555'

mesh.material = new Jax.Material.Surface
  intensity:
    ambient: 1
    diffuse: 1
    specular: 1
  color:
    ambient:  '#f00'
    diffuse:  '#00f'
    specular: '#0f0'
  pcf: false
  shininess: 1


###
## [Jax.Material.Wire](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/material/wire.js.coffee)

<canvas />

The `Wire` material inherits from `Surface` and accepts all of the same options. There is also a built-in instance called `"wire"` which you can assign as a shorthand; this is equivalent to the `"default"` material in every way, except that it produces a wireframe mesh.
###
light.color.ambient = '#555'

mesh.material = new Jax.Material.Wire
  intensity:
    ambient: 1
    diffuse: 1
    specular: 1
  color:
    ambient:  '#f00'
    diffuse:  '#00f'
    specular: '#0f0'
  pcf: false
  shininess: 1


###
## [Jax.Material.Custom](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/material/custom.js.coffee)

<canvas />

A basic type of material inheriting from the base `Jax.Material` class. It does not define any layers directly, so it is an ideal candidate when you want to mix and match layers together ([you can view those here](https://github.com/sinisterchipmunk/jax/tree/master/lib/assets/javascripts/shaders)). By itself, this type of material produces no renderable result. All other built-in materials inherit from `Jax.Material.Custom`.
###
mesh.material = new Jax.Material.Custom
  layers: [
    { type: "Position" }
    { type: "Depthmap" }
  ]


###
## [Jax.Material.Legacy](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/material/legacy.js.coffee)

<canvas />

This is a compatibility class which accepts options for Jax v2.x materials and reformats them for Jax v3.x. This is mostly here to assist in the upgrade process. Developers performing upgrades can optionally use this material type, even in production, but are encouraged to use one of the other material types for their added flexibility.
###
mesh.material = new Jax.Material.Legacy
  ambient:  { red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0 }
  diffuse:  { red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0 }
  specular: { red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0 }
  shininess: 0
  layers: [
    { type: "Lighting" }
    { type: "Texture",  path: "/assets/images/rock.png",       scale: 0.25 }
    { type: "NormalMap",path: "/assets/images/rock_normal.png",scale: 0.25 }
  ]


###
## Adding layers

<canvas />

You can add layers to any material by passing a `layers` option. Unless a material has special handling for the layers, they will be appended to the end of the material's layer chain. If you need to insert layers into specific positions in the chain, you'll need to call the [`insertLayer`](https://github.com/sinisterchipmunk/jax/blob/master/lib/assets/javascripts/jax/material.js.coffee.erb) method after instantiating the material.
###
mesh.material = new Jax.Material.Surface
  intensity:
    ambient: 1
    diffuse: 1
    specular: 1
  color:
    ambient:  '#fff'
    diffuse:  '#fff'
    specular: '#fff'
  pcf: false
  shininess: 0
  layers: [
    { type: "Fog", density: 0.175, color: '#f00' }
  ]


