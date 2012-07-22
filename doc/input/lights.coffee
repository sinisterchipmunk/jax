###
If WebGL is enabled, the thumbnails to the left of each description will be directly generated, in realtime, by the code snippets to the right -- so you can rest assured that that the examples are accurate. (If WebGL is not enabled, you'll have to take my word for it.)

## Setup

In each of the following examples, this code is evaluated as part of the scene set-up. This code is only used to help set up the scene, and isn't specific to any one example.
###
@activeCamera.position = [0, 0, 3]
@teapot = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Teapot
  update: (tc) -> @camera.yaw tc


###
## World Ambient Color

<canvas />

The _ambient_ component of light represents light that has no particular direction. The Jax lighting model includes two forms of ambient light: that which is associated with individual light sources, and that which applies to the entire scene. The latter is a property of `world` called `ambientColor`. If you apply only world ambient lighting, an object will look flat and featureless because there is no shading to give it definition.
###
@world.ambientColor = '#aaccff'


###
## Ambient Lighting

<canvas />

In addition to the world ambient color, each light source has its own ambient component. Like world ambient, light ambient is non-directional and objects lit solely by it seem to have very little texture. Unlike world ambient, however, light ambient is _attenuated_. That is, the further away the light source is from the object, the less the ambient component will be applied. This produces a gradient effect across illuminated objects.
###
@world.addLight new Jax.Light.Point
  position: [1, 1, 1]
  color:
    ambient: '#ccc'


###
## Diffuse Lighting

<canvas />

A light's diffuse component is where most of an object's surface features come from. It simulates illumination of an object and very basic self-shadowing in that a surface facing away from the light will be darker, and a surface facing toward the light will be brighter.
###
@world.addLight new Jax.Light.Point
  position: [1, 1, 1]
  color:
    diffuse: '#ccc'


###
## Specular Lighting

<canvas />

Specular lighting represents the shininess of an object. Reflective surfaces like polished chrome have a very high specular component, while less reflective surfaces like wood have a very low specular component.

An object's specular intensity isn't controlled by the light source, however. Its material determines that; the light only determines the _color_ of the specular component.
###
@world.addLight new Jax.Light.Point
  position: [1, 1, 1]
  color:
    specular: '#ccc'


###
## Directional Lights

<canvas />

Directional lights are lights that have a direction, but no position. They are frequently used to emulate massive, distant sources such as the sun.
###
@world.addLight new Jax.Light.Directional
  direction: [-1, -1, -1]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'


###
## Point Lights

<canvas />

Point lights are sort of the opposite of directional lights: they have a position, but no direction. Instead, they eminate in all directions from a specific point in space. No one pixel is lit from exactly the same direction as another.
###
@world.addLight new Jax.Light.Point
  position: [0, 0, 1.5]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'


###
## Spot Lights

<canvas />

Spot lights are basically point lights that shine in a cone-shaped projection. Given a direction and some angle, anything within their cone of influence is illuminated, while anything outside of it is not.

Spot lights have an outer and inner angle. Both angles are relative to the light's actual direction. The inner angle describes the cone of influence within which the object is completely illuminated. Beyond the edges of the inner angle, the light's influence begins to fall off. The outer angle represents the absolute maximum angle from the light's actual direction, beyond which the light has no influence on the object at all.
###
@world.addLight new Jax.Light.Spot
  position: [0, 0, 1.5]
  direction: [0, 0, -1]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'
  innerSpotAngle: Math.deg2rad(16)
  outerSpotAngle: Math.deg2rad(20)


###
## Attenuation

Attenuation represents how quickly the light falls off as it becomes more distant. The attenuation function is calculated like so:

    total = constant
          + linear * distance
          + quadratic * distance * distance

where `constant` is the constant attenuation factor, `linear` is the linear attenuation factor, and `quadratic` is the quadratic attenuation factor. Each of these are discussed in more detail, below.

**Note:** the attenuation factor of directional light cannot be modified. Because directional light has no position, its distance is infinite and cannot be measured, and therefore it cannot be attenuated.
###


###
## Constant Attenuation

<canvas />

Constant attenuation represents how much of the light _never_ falls off. Refer to the attenuation formula: constant attenuation is never affected by distance and is always added to the equation.
###
point = @world.addLight new Jax.Light.Point
  position: [2, 0, 1.5]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'
  attenuation:
    constant: 1
    linear: 0
    quadratic: 0
rotation = 0
marker = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Sphere(radius: 0.1, slices: 4, stacks: 4, color: '#000')
  update: (tc) ->
    rotation += tc
    position = [Math.cos(rotation) * 2, 0, 1.5]
    @camera.position = position
    point.position = position


###
## Linear Attenuation

<canvas />

Linear attenuation falls off with distance at a fixed rate. A light with its linear attenuation set to 1.0 (and its other attenuation factors set to 0.0) is believable for most light sources.
###
point = @world.addLight new Jax.Light.Point
  position: [2, 0, 1.5]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'
  attenuation:
    constant: 0
    linear: 1
    quadratic: 0
rotation = 0
marker = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Sphere(radius: 0.1, slices: 4, stacks: 4, color: '#000')
  update: (tc) ->
    rotation += tc
    position = [Math.cos(rotation) * 2, 0, 1.5]
    @camera.position = position
    point.position = position


###
## Quadratic Attenuation

<canvas />

Quadratic attenuation increases the falloff with distance. That is, as the light source gets further away from a surface, it diminishes more rapidly. A light with its quadratic attenuation component set to 1.0 and its other components set to 0.0 does not produce a very believable effect for a "regular" light, but works quite well for simulating an environment where something other than air occludes the light, such as thick fog, smoke or water.
###
point = @world.addLight new Jax.Light.Point
  position: [2, 0, 1.5]
  color:
    ambient: '#111'
    specular: '#fff'
    diffuse: '#acf'
  attenuation:
    constant: 0
    linear: 0
    quadratic: 1
rotation = 0
marker = @world.addObject new Jax.Model
  mesh: new Jax.Mesh.Sphere(radius: 0.1, slices: 4, stacks: 4, color: '#000')
  update: (tc) ->
    rotation += tc
    position = [Math.cos(rotation) * 2, 0, 1.5]
    @camera.position = position
    point.position = position
